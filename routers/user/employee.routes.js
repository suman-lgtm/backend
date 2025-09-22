const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const {
  createEmployee,
  register,
  login,
  getProfile,
} = require("../../controllers/user/user.controller");

const router = express.Router();

router.route("/new-user-create").post(register);
router.route("/login").post(login);
// router.route("/logout").post(logout);
router.route("/getProfile").get(authMiddleware, getProfile);
router.route("/register-employee").post(authMiddleware, createEmployee);

module.exports = router;
