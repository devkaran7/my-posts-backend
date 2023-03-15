const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    maxlength: [40, "Name should be under 40 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password should be atleast 8 characters long"],
    maxlength: [16, "Password should be less than 16 characters long"],
    select: false,
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
  posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  saved: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//validate the password with passed on user password
userSchema.methods.isCorrectPassword = async function (usersendPassword) {
  return await bcrypt.compare(usersendPassword, this.password);
};

//create and return jwt
userSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

module.exports = mongoose.model("User", userSchema);
