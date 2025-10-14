const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const {
  login,
  getProfile,
  sendOtp,
  verifyOtpAndResetPassword,
  updateContactInfo,
} = require("../../controllers/user/user.controller");

const router = express.Router();

router.route("/login").post(login);
// router.route("/logout").post(logout);
router.route("/send-otp").post(sendOtp);
router.route("/verify-otp-reset-password").post(verifyOtpAndResetPassword);
router.route("/getProfile").get(authMiddleware, getProfile);
router.patch("/update-contact-info", updateContactInfo);

module.exports = router;
