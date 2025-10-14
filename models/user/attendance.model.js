const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    sessions: [
      {
        clockIn: { type: Date },
        clockOut: { type: Date },
      },
    ],

    breaks: [
      {
        breakIn: { type: Date },
        breakOut: { type: Date },
      },
    ],

    isWorking: {
      type: Boolean,
      default: false,
    },

    // stored in decimal hours (e.g. 7.5 = 7h 30m)
    totalWorkHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["full-day", "absent", "late", "half-day", "on-leave"],
      default: "present",
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate entries for same employee & date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// ✅ calculate work hours
attendanceSchema.methods.calculateWorkHours = function () {
  let totalMs = 0;

  // Sum all sessions
  this.sessions.forEach((s) => {
    if (s.clockIn && s.clockOut) {
      totalMs += s.clockOut - s.clockIn;
    }
  });

  // Subtract breaks
  if (this.breaks && this.breaks.length > 0) {
    this.breaks.forEach((b) => {
      if (b.breakIn && b.breakOut) {
        totalMs -= b.breakOut - b.breakIn;
      }
    });
  }

  const totalMinutes = Math.floor(totalMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
};

// ✅ auto-update totalWorkHours before save
attendanceSchema.pre("save", function (next) {
  const { hours, minutes } = this.calculateWorkHours();
  this.totalWorkHours = hours + minutes / 60; // store as decimal in DB
  next();
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
