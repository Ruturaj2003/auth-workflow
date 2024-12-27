const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  // const token = createJWT({ payload: user });
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneHour = 1000 * 60 * 60 * 1;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneHour),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneWeek),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};
// For refrerence
// const attachSingleToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === "production",
//     signed: true,
//   });
// };

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
