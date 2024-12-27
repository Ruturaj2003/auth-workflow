const sendEmail = require("./sendEmail");
const sendResetPassword = async ({ name, email, token, origin }) => {
  const resetURL = `${origin}/user/reset-passowrd?token=${token}&email=${email}`;

  const message = `
  <p> Click to reset Password</p>
  <br/>
<h3>
    <a href='${resetURL}' >
        Reset
    </a>
</h3
  `;

  return sendEmail({
    to: email,
    subject: "Reset Passowrd",
    html: `Hello ${name}, ${message}`,
  });
};

module.exports = sendResetPassword;
