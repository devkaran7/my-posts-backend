const Comment = require("../models/comment");
const Post = require("../models/post");
const CustomError = require("../utils/CustomError");

exports.createComment = async (req, res, next) => {
  const postId = req.params.id;
  const text = req.body.text;
  const userId = req.user._id;
  if (!text) {
    return next(
      new CustomError("please provide some text to post a comment", 400)
    );
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return next(new CustomError("place not found", 404));
    }
    const comment = await Comment.create({
      text,
      post: postId,
      creator: userId,
    });
    post.comments.push(comment._id);
    await post.save();
    comment.creator = req.user;
    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(new CustomError("something went wrong", 500));
  }
};

exports.getAllComments = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
      .populate("creator")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(new CustomError("something went wrong", 500));
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new CustomError("comment not found", 404));
    }
    if (comment.creator.toString() !== req.user._id.toString()) {
      return next(
        new CustomError("you are not authorized to delete this comment", 401)
      );
    }
    const post = await Post.findById(comment.post);
    post.comments = post.comments.filter(
      (p) => p.toString() !== commentId.toString()
    );
    await post.save();
    await comment.delete();
    res.status(200).json({ success: true, message: "comment deleted" });
  } catch (error) {
    next(new CustomError("something went wrong", 500));
  }
};

exports.editComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const text = req.body.text;
    if (!text) {
      return next(
        new CustomError("please provide some text to post a comment", 400)
      );
    }
    let comment = await Comment.findById(commentId);
    if (!comment) {
      return next(new CustomError("comment not found", 404));
    }
    if (comment.creator.toString() !== req.user._id.toString()) {
      return next(
        new CustomError("you are not authorized to delete this comment", 401)
      );
    }
    comment = await Comment.findByIdAndUpdate(commentId, { text });
    res.status(200).json({ success: true, comment });
  } catch (error) {
    next(new CustomError("something went wrong", 500));
  }
};
