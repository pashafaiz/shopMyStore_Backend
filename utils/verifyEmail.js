const axios = require('axios');

const verifyEmail = async (email) => {
  try {
    const response = await axios.get('http://apilayer.net/api/check', {
      params: {
        access_key: process.env.MAILBOXLAYER_API_KEY,
        email: email,
        smtp: 1,
        format: 1,
      },
    });

    const data = response.data;
    console.log("📬 MailboxLayer response:", data);

    return data.smtp_check && data.format_valid;
  } catch (error) {
    console.error("Email verification error:", error.message);
    return false;
  }
};

module.exports = verifyEmail;
