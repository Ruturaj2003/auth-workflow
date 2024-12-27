const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
} = require("../utils");

const crypto = require("crypto");
const Token = require("../models/Token");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });
  const origin = "http://localhost:3000";
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });
  // Send Verification Token : For Postman Testing Only
  res.status(StatusCodes.CREATED).json({
    msg: "Sucesss !  , Please Check you email to verify",
    verificationToken,
  });
};

// Email Verify
const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  user.isVerified = true;
  user.verified = Date.now();

  user.verificationToken = ""; // Verification link wont work again
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  if (user.isVerified === false) {
    throw new CustomError.UnauthenticatedError("Please Verify First");
  }

  const tokenUser = createTokenUser(user);

  // Check for exisitng token
  let refreshToken = "";
  const exisitingToken = await Token.findOne({ user: user._id });

  if (exisitingToken) {
    const { isValid } = exisitingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Creds");
    }
    refreshToken = exisitingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });

    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");

  const userAgent = req.headers["user-agent"];

  const ip = req.ip;

  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  };
  const token = await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser, token });
};
const logout = async (req, res) => {
  await Token.findOneAndDelete({
    user: req.user.userId,
  });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 100),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 100),
  });

  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError("Provide Valid Email");
  }
  const user = await User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    // Send Email

    const tenMin = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMin);

    user.passwordToken = passwordToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }
  res.status(StatusCodes.OK).json("Please Check Email for reset Passowrd Link");
};

const resetPassword = async (req, res) => {
  res.send("I reset");
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
// const tokenUser = createTokenUser(user);
// attachCookiesToResponse({ res, user: tokenUser });
// res.status(StatusCodes.CREATED).json({ user: tokenUser });
