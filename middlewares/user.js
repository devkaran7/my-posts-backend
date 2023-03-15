const User = require("../models/user");
const CustomError = require("../utils/CustomError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = async (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.header("Authorization")) {
    token = req.header("Authorization").replace("Bearer ", "");
  }
  if (!token) {
    return next(new CustomError("Login to access this page", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  try {
    req.user = await User.findById(decoded.id);
  } catch (error) {
    return next(new CustomError("Something went wrong", 500));
  }

  next();
};
