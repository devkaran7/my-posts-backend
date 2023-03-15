const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPost,
  updatePost,
  deletePost,
  updateLike,
  savePost,
} = require("../controllers/postcontroller");
const { isLoggedIn } = require("../middlewares/user");

router.post("/post/new", isLoggedIn, createPost);
router.post("/post/like/:id", isLoggedIn, updateLike);
router.post("/post/save/:id", isLoggedIn, savePost);
router.get("/posts", getAllPosts);
router.get("/post/:id", getPost);
router.patch("/post/update/:id", isLoggedIn, updatePost);
router.delete("/post/delete/:id", isLoggedIn, deletePost);

module.exports = router;
