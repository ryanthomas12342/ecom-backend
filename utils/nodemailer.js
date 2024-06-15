const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper

  const message = {
    from: process.env.USER, // sender address
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};

module.exports = mailHelper;
