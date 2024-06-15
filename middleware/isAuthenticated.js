const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");
const User = require("../models/user");

exports.isAuthenticated = async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");

  console.log(token);

  if (!token) {
    return next(new CustomError("Auth require", 400));
  }

  // const res1 = await User.findById(decode._id);
  // console.log(res1);
  // console.log("this is it", jwt.verify(token, process.env.JWT_SECRET));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id); // Fix: Use the correct property from the decoded token
    if (!req.user) {
      return next(new CustomError("User not found", 400));
    }
    next();
  } catch (err) {
    return next(new CustomError("Not a verified token", 400));
  }
};
exports.customRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError("Your are not eligible to this resource", 402)
      );
    }

    next();
  };
};
