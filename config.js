const dotenv = require('dotenv');
dotenv.config();
const config = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY: process.env.TWILIO_API_KEY,
  TWILIO_API_SECRET: process.env.TWILIO_API_SECRET,
  AUTH_TOKEN: process.env.AUTH_TOKEN,
};

module.exports = config;
