const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const client = require('twilio')(
  config.TWILIO_API_KEY,
  config.TWILIO_API_SECRET,
  {
    accountSid: config.TWILIO_ACCOUNT_SID,
  }
);

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Endpoint to create a room
const findOrCreateRoom = async (roomName) => {
  try {
    await client.video.v1.rooms(roomName).fetch();
    console.log(`Room ${roomName} already exists.`);
  } catch (error) {
    // the room was not found, so create it
    if (error.code == 20404) {
      try {
        await client.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'go',
        });
        console.log(`Room ${roomName} created successfully.`);
      } catch (createError) {
        console.error(`Error creating room ${roomName}:`, createError);
      }
    } else {
      throw error;
    }
  }
};
const getAccessToken = (roomName) => {
  const token = new AccessToken(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET,
    {
      identity: uuidv4(),
    }
  );
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  return token.toJwt();
};
// Endpoint to join a room
app.post('/join-room', async (req, res) => {
  let { roomName } = req.body;
  if (!req.body || !roomName) {
    return res.status(400).send({ message: 'Must include roomName argument.' });
  }
  findOrCreateRoom(roomName);
  const token = getAccessToken(roomName);
  res.send({ token: token });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
