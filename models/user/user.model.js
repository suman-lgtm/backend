const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: ["HR", "Operations", "Sales", "IT", "Management"],
      required: true,
    },
    role: {
      type: String,
      enum: [
        // Top level
        "Founder",
        "Director",

        // HR
        "HR Head",
        "HR Manager",
        "HR Executive",

        // Operations
        "OP Head",
        "OP Manager",
        "OP Executive",

        // Sales hierarchy
        "Regional Head",
        "Zonal Head",
        "Branch Manager",
        "Assitatnt Branch Manager", // Assitatnt branch Manager
        "Senior Sales Manager", // Senior Sales Manager
        "Sales Manager", // Sales Manager
        "RM", // Relationship Manager

        "IT",

        // Generic fallback
        "Employee",
      ],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    profilePic: {
      type: String,
    },

    // Reference to their direct senior/manager
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // For multi-level reporting
    senior: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // Team members reporting to this employee
    team: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
      },
    ],

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

employeeSchema.index({ manager: 1 });

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
