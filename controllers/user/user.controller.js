const bcrypt = require("bcryptjs");
const Employee = require("../../models/user/user.model");
const jwt = require("jsonwebtoken");
const OTP = require("../../models/user/otp.model");
const sendOTPEmail = require("../../service/nodemailer");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(user.department);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      department: user.department,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete any previous OTPs for this user
    await OTP.deleteMany({ user: user._id });

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000);

    // Save OTP in DB (expires in 5 minutes via TTL index)
    const otpEntry = await OTP.create({ user: user._id, otp: otpCode });

    // Send OTP via email
    await sendOTPEmail(email, otpCode);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
};

const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Check required fields
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Find user by email
    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find OTP for this user
    const otpEntry = await OTP.findOne({ user: user._id, otp: Number(otp) });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash new password

    user.password = await bcrypt.hash(newPassword.trim(), 10);

    await user.save();

    // Delete OTP after successful reset
    await OTP.deleteMany({ user: user._id });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: true,
//       sameSite: "Strict",
//     });

//     res.json({ message: "Logout successful" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user data" });
    }

    const user = await Employee.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateContactInfo = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { email, phone } = req.body;

    // Validate input
    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Provide email or phone to update." });
    }

    // Find employee by employeeId
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Update only email and/or phone
    if (email) employee.email = email;
    if (phone) employee.phone = phone;

    await employee.save();

    return res.status(200).json({
      message: "Contact info updated successfully.",
      employee: {
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
      },
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  login,
  getProfile,
  sendOtp,
  verifyOtpAndResetPassword,
  updateContactInfo,
};
