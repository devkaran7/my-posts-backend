const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getOneUserData,
  updateLoggedInUserDetails,
  changePassword,
  getAllUsers,
} = require("../controllers/usercontroller");
const { isLoggedIn } = require("../middlewares/user");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", isLoggedIn, logout);
router.get("/users/:id", getOneUserData);
router.get("/users", getAllUsers);
router.patch("/profile/update", isLoggedIn, updateLoggedInUserDetails);
router.patch("/profile/update/password", isLoggedIn, changePassword);

module.exports = router;
