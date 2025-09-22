const OTP = require("../models/user/otp.model");
const sendOTPEmail = require("../service/nodemailer");

const otpSend = async ({ user }) => {
  await OTP.deleteMany({ user: user._id });
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otpEntry = new OTP({
    user: user._id,
    otp: otpCode,
    expiresAt,
  });
  await otpEntry.save();
  await sendOTPEmail(user.email, otpCode);
};

module.exports = { otpSend };
