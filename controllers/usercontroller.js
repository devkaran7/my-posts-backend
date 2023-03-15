const User = require("../models/user");
const CustomError = require("../utils/CustomError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
      return next(
        new CustomError("name, email and password are required", 400)
      );
    }

    let photo;
    if (req.files) {
      let file = req.files.photo;
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "myplaces/users",
      });
      photo = { id: result.public_id, secure_url: result.secure_url };
    }

    const user = await User.create({ name, email, password, photo });
    user.password = undefined;

    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    next(new CustomError("Something went wrong", 500));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError("email and password are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new CustomError("user not found", 404));
    }

    const isAuth = await user.isCorrectPassword(password);
    if (!isAuth) {
      return next(new CustomError("email and password does not match", 401));
    }

    user.password = undefined;
    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    next(new CustomError("Something went wrong", 500));
  }
};

exports.logout = async (req, res, next) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({ success: true, message: "logged out!" });
};

exports.getOneUserData = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id)
      .populate({
        path: "posts",
        options: {
          sort: { createdAt: -1 },
        },
        populate: {
          path: "creator",
        },
      })
      .populate({
        path: "saved",
        options: {
          sort: { createdAt: -1 },
        },
        populate: {
          path: "creator",
        },
      });
    if (!user) {
      return next(new CustomError("user not found", 404));
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    next(new CustomError("Something went wrong", 500));
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    next(new CustomError("something went wrong", 500));
  }
};

exports.updateLoggedInUserDetails = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const newData = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.files && req.files.photo) {
      const user = await User.findById(userId);
      await cloudinary.uploader.destroy(user.photo.id);

      const result = await cloudinary.uploader.upload(
        req.files.photo.tempFilePath,
        {
          folder: "myplaces/users",
        }
      );
      newData.photo = { id: result.public_id, secure_url: result.secure_url };
    }

    const user = await User.findByIdAndUpdate(userId, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    next(new CustomError("something went wrong", 500));
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldpassword, password } = req.body;

    if (!oldpassword || !password) {
      return next(new CustomError("old password and password are required"));
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select("+password");

    const isCorrectOldPassword = await user.isCorrectPassword(oldpassword);

    if (!isCorrectOldPassword) {
      return next(new CustomError("old password does not match", 400));
    }

    user.password = password;
    await user.save();

    cookieToken(user, res);
  } catch (error) {
    console.log(error);
    next(new CustomError("something went wrong", 500));
  }
};
