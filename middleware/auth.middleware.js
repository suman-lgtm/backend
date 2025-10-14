const jwt = require("jsonwebtoken");
const Employee = require("../models/user/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Read token from Authorization header
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await Employee.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "inactive") {
      return res.status(404).json({ message: "Access denied: User account inactive." });
    }

    req.user = {
      id: user._id,
      department: user.department,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
