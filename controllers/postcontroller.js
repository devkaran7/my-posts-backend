const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const CustomError = require("../utils/CustomError");
const cloudinary = require("cloudinary").v2;

exports.createPost = async (req, res, next) => {
  const { location, caption } = req.body;
  if (!location || !caption) {
    return next(
      new CustomError("location and caption are required to create a post", 400)
    );
  }
  let photo;
  if (req.files && req.files.photo) {
    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "myplaces/posts",
      }
    );
    photo = { id: result.public_id, secure_url: result.secure_url };
  } else {
    return next(new CustomError("image is required to create a post", 400));
  }
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError("user does not exists", 404));
    }
    const post = await Post.create({
      photo,
      location,
      caption,
      creator: req.user._id,
    });
    user.posts.push(post._id);
    await user.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .populate("creator")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (error) {
    return next(new CustomError("Something went wrong", 500));
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let post = await Post.findById(postId)
      .populate("creator")
      .populate({ path: "comments", sort: { createdAt: -1 } });
    if (!post) {
      return next(new CustomError("post not found", 404));
    }
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.log(error);
    return next(new CustomError("Something went wrong", 500));
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let post = await Post.findById(postId);
    if (!post) {
      return next(new CustomError("post not found", 404));
    }
    if (post.creator.toString() !== req.user._id.toString()) {
      return next(
        new CustomError("you are not authorized to edit this post", 401)
      );
    }
    post = await Post.findByIdAndUpdate(postId, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.log(error);
    return next(new CustomError("Something went wrong", 500));
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    let post = await Post.findById(postId);
    if (!post) {
      return next(new CustomError("post not found", 404));
    }
    if (post.creator.toString() !== req.user._id.toString()) {
      return next(
        new CustomError("you are not authorized to delete this post", 401)
      );
    }
    const user = await User.findById(post.creator);
    if (!user) {
      return next(new CustomError("user not found", 400));
    }
    user.posts = user.posts.filter((p) => p.toString() !== postId);
    await cloudinary.uploader.destroy(post.photo.id);
    await user.save();
    for (let i = 0; i < post.comments.length; i++) {
      await Comment.findByIdAndDelete(post.comments[i]);
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ success: true, message: "post deleted!" });
  } catch (error) {
    console.log(error);
    return next(new CustomError("Something went wrong", 500));
  }
};

exports.updateLike = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(new CustomError("post not found", 404));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError("user not found", 404));
    }
    const liked = post.likes.filter((p) => p.toString() !== userId.toString());
    let message;
    if (liked.length === post.likes.length) {
      post.likes.push(userId);
      message = "liked";
    } else {
      post.likes = liked;
      message = "disliked";
    }
    await post.save();
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log(error);
    next(new CustomError("something went wrong", 500));
  }
};

exports.savePost = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(new CustomError("post not found", 404));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(new CustomError("user not found", 404));
    }
    let message;
    if (user.saved.find((p) => p.toString() === postId.toString())) {
      user.saved = user.saved.filter((p) => p.toString() !== postId.toString());
      await user.save();
      message = "removed from saved posts";
    } else {
      user.saved.push(postId);
      await user.save();
      message = "added to saved posts";
    }
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log(error);
    next(new CustomError("something went wrong", 500));
  }
};
