const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  const msg = "<p> Please Click to Confirm";

  return sendEmail({
    to: email,
    subject: "Email Conformation",
    html: `<h3>Hello ${name}</h3>
    <br/>
   <b> 
    <h1>
        <a href="${verifyEmail}">
            Verify Email :D
        </a>
    </h1/>
   </b>
    ${msg}`,
  });
};

module.exports = sendVerificationEmail;
