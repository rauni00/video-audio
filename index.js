const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
let TwilioVideoCall = require('temp-twilio-call');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY;
const apiKeySecret = process.env.TWILIO_API_SECRET;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('<h1>Twilio-video</h1>');
});
// Endpoint to join a room
app.post('/join-room', async (req, res) => {
  let { roomName } = req.body;
  const twilioVideoCall = new TwilioVideoCall(
    accountSid,
    apiKeySid,
    apiKeySecret
  );
  let token = await twilioVideoCall.joinRoom(roomName || 'roomname', uuidv4());
  res.send({ token: token });
});

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
