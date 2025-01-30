import http from 'http';
import express from 'express';
import pkg from 'agora-access-token';
import cors from 'cors';

import dotenv from 'dotenv';
const result = dotenv.config();


const { RtcRole, RtcTokenBuilder } = pkg;

// App credentials
const appID = process.env.APP_ID;
const appCertificate = process.env.APP_CERTIFICATE;

// Server configuration
const PORT = 3000;

// Express app setup
const app = express();
app.set('port', PORT);

// CORS setup
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Route to generate RTC token
app.get('/rtcToken', (req, res) => {
  const { channelName, uid, role } = req.query;

  // Validate required parameters
  if (!channelName || !uid || !role) {
    return res.status(400).json({ error: 'channelName, uid, and role are required' });
  }

  // Token expiration time
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + 3600;

  try {
    // Generate the RTC token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      parseInt(uid),
      parseInt(role),
      privilegeExpiredTs
    );

    console.log(`Generated token: ${token}`);
    return res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
http.createServer(app).listen(app.get('port'), () => {
  console.log(`AgoraSignServer starts at http://localhost:${PORT}`);
});
