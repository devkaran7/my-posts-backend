const express = require("express");
const router = express.Router();
const {
  getAllComments,
  createComment,
  deleteComment,
  editComment,
} = require("../controllers/commentcontroller");
const { isLoggedIn } = require("../middlewares/user");

router.get("/comments/:id", getAllComments);
router.post("/newcomment/:id", isLoggedIn, createComment);
router.delete("/comment/:id", isLoggedIn, deleteComment);
router.patch("/comment/:id", isLoggedIn, editComment);

module.exports = router;
