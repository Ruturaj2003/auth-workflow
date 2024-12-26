const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const msg = "<p> Please Click to Confirm";

  return sendEmail({
    to: email,
    subject: "Email Conformation",
    html: `<h3>Hello ${name}</h3>
    <br/>
    ${msg}`,
  });
};

module.exports = sendVerificationEmail;
