const User = require("../models/user");
const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError");
const bigPromise = require("../middleware/bigPromise");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.signup = bigPromise(async (req, res, next) => {
  let result;
  if (req.files) {
    let file = req.files.photo;
    try {
      result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale",
      });
    } catch (error) {
      return next(new CustomError("File upload failed", 500));
    }
  }
  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new CustomError("name emaila nd password are required", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    photo: req.files
      ? {
          id: result.public_id || "",
          secure_url: result.secure_url || "",
        }
      : {},
  });

  cookieToken(user, res);
});

exports.login = bigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("both password and email are requried ", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomError("user not found"));
  }

  if (!(await user.IsValidatePassword(password))) {
    return next(new CustomError("Not a valid password"));
  }
  console.log(await user.IsValidatePassword(password));
  cookieToken(user, res);
});

exports.forgotPassword = bigPromise(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email not found", 400));
  }

  const forgotToken = user.getForgotPassword();

  try {
    await user.save({ validateBeforeSave: false });

    const myurl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${forgotToken}`;

    const message = `Copy paste this link in your URL and hit enter: ${myurl}`;

    await mailHelper({
      email: user.email,
      subject: "Password reset email",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new CustomError(err.message, 500));
  }
});

exports.logout = bigPromise(async (req, res, next) => {
  const email = req.user.email;

  console.log(req.user);

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    sucess: true,
    message: "logout sucess",
  });
});

exports.resetPass = bigPromise(async (req, res, next) => {
  const { token } = req.params;

  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("the user is not present", 401));
  }

  if (req.body.password != req.body.confirmPass) {
    return next(new CustomError("Make sure the passords are same ", 401));
  }

  user.password = req.body.password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    sucess: true,
    user,
  });
});

module.exports.getLoggedInUser = bigPromise(async (req, res, next) => {
  console.log(req.user);
  const user = await User.findById(req.user._id);

  res.status(200).json({
    sucess: true,
    user,
  });
});

exports.updatePass = bigPromise(async (req, res, next) => {
  const { oldPass, newPass } = req.body;
  const { id } = req.params;
  if (!id) {
    return next(new CustomError("The id is not valid", 400));
  }
  if (!oldPass && !newPass) {
    return next(
      new CustomError("Please provide both the old and new passwordsd ", 400)
    );
  }

  const user = await User.findById(id).select("+password");

  if (!user) {
    return next(new CustomError("The user is not valid", 400));
  }

  console.log(user, oldPass, newPass);
  const isValid = await user.IsValidatePassword(oldPass);
  if (!isValid) {
    return next(new CustomError("Enter a valid password to update ", 401));
  }

  user.password = newPass;

  await user.save();

  cookieToken(user, res);
});

exports.updateProfile = bigPromise(async (req, res, next) => {
  const { name, email } = req.body;

  const newData = {
    name,
    email,
  };

  if (req.files) {
    let file = req.files.photo;

    const user = await User.findById(req.user._id);

    const imageId = user.photo.id;

    const resp = await cloudinary.v2.uploader.destroy(imageId);

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id || "",
      secure_url: result.secure_url || "",
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    sucess: true,
    user,
  });
});
exports.adminupdateProfile = bigPromise(async (req, res, next) => {
  //ADMIN can update anyones profile
  const { id } = req.params;
  const { name, email, role } = req.body;

  const newData = {
    name,
    email,
    role,
  };

  if (req.files) {
    let file = req.files.photo;

    const user = await User.findById(req.user._id);

    const imageId = user.photo.id;

    const resp = await cloudinary.v2.uploader.destroy(imageId);

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "users",
      width: 150,
      crop: "scale",
    });
    newData.photo = {
      id: result.public_id || "",
      secure_url: result.secure_url || "",
    };
  }

  const user = await User.findByIdAndUpdate(id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    sucess: true,
    user,
  });
});
exports.adminUserAll = bigPromise(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    sucess: true,
    users,
  });
});
exports.managerUserAll = bigPromise(async (req, res, next) => {
  //Can only see al the roles of the users
  const users = await User.find({ role: "user" });

  res.status(200).json({
    sucess: true,
    users,
  });
});

exports.singleUser = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("the user does not exisst", 403));
  }

  res.status(200).json({
    sucess: true,
    user,
  });
});

exports.deleteUser = bigPromise(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  const photoId = user.photo.id;

  await cloudinary.v2.uploader.destroy(photoId);
  if (!user) {
    return next(new CustomError("user is not valid to be deleted", 400));
  }

  res.status(200).json({
    sucess: true,
    user,
  });
});
