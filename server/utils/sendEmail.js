const nodemailer = require("nodemailer");

const sendEmail = async () => {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "pat.murazik@ethereal.email",
      pass: "4QXb6Aa8x5ReAfkStS",
    },
  });

  let info = await transporter.sendMail({
    from: '"Dota" <dota@gmail.com>',
    to: "deas@example.com,pat.murazik@ethereal.email",
    subject: "My First Message",
    text: "Hello World",
    html: "<b>Hello World ? </b>",
  });
};

module.exports = sendEmail;
