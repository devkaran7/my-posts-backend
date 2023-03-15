const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  photo: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  caption: {
    type: String,
    required: true,
    trim: true,
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User",
  },
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
