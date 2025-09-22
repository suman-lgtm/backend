const bcrypt = require("bcryptjs");
const Employee = require("../../models/user/user.model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { employeeId, name, email, phone, department, role, password } =
      req.body;

    if (
      !employeeId ||
      !name ||
      !email ||
      !phone ||
      !department ||
      !role ||
      !password ||
      !employeeId ||
      !name ||
      !email ||
      !phone ||
      !department ||
      !role ||
      !password.trim() === ""
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this email or ID already exists." });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newEmployee = new Employee({
      employeeId,
      name,
      email,
      phone,
      department,
      role,
      password: hashedPassword,
    });

    await newEmployee.save();

    res.status(201).json({
      message: "User registered successfully",
      employee: {
        id: newEmployee._id,
        employeeId: newEmployee.employeeId,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role,
        status: newEmployee.status,
      },
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token });
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

const createEmployee = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "hr") {
      return res
        .status(403)
        .json({ message: "Access denied. Only HR can create employees." });
    }

    const {
      employeeId,
      name,
      email,
      phone,
      department,
      role,
      password,
      manager,
      senior,
    } = req.body;

    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ message: "Employee with this email or ID already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      employeeId,
      name,
      email,
      phone,
      department,
      role,
      password: hashedPassword,
      manager,
      senior,
      //   team,
    });

    await newEmployee.save();

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        id: newEmployee._id,
        employeeId: newEmployee.employeeId,
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        role: newEmployee.role,
        status: newEmployee.status,
      },
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createEmployee, register, login, getProfile };
