const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  otp: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
