const bcrypt = require("bcryptjs");
const Employee = require("../../models/user/user.model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { employeeId, name, email, phone, department, role, password } =
      req.body;

    // 1. Basic validation
    if (
      !employeeId ||
      !name ||
      !email ||
      !phone ||
      !department ||
      !role ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!password.trim()) {
      return res.status(400).json({ message: "Password cannot be empty." });
    }

    // Optional: validate phone as string (if you later change schema)
    // if (!/^\d{7,15}$/.test(phone)) {
    //   return res.status(400).json({ message: "Invalid phone number." });
    // }

    // 2. Check for existing employee
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee with this email or ID already exists.",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const employeeData = {
      employeeId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      department,
      role,
      password: hashedPassword,
    };

    // Add manager if provided
    if (req.body.manager) {
      employeeData.manager = req.body.manager;
    }

    // Add senior if provided
    if (req.body.senior) {
      employeeData.senior = req.body.senior;
    }

    // 4. Create new employee
    const newEmployee = new Employee(employeeData);

    await newEmployee.save();

    // 5. Response (don’t send password back)
    res.status(201).json({
      message: "User registered successfully",
      newEmployee,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

module.exports = { register, login, getProfile };
