const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "PLease provide a name"],
  },
  email: {
    type: String,
    unique: true, // Enforce unique emails

    required: [true, "PLease provide a email"],
    validate: [validator.isEmail, "PLease enter an email in correct format"],
  },
  password: {
    type: String,
    required: [true, "PLease provide a password"],
    minLength: [6, "PASS should be atleast 6 chars"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      // required: true,
    },
    secure_url: {
      type: String,
      // required: true,
    },
  },
  forgotPasswordToken: {
    type: String,
  },
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.IsValidatePassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};
//create and return jwt

userSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

//generate forgot password token(string)

userSchema.methods.getForgotPassword = function () {
  const forgotToken = crypto.randomBytes(20).toString("hex");

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  return forgotToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
