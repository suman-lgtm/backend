const Attendance = require("../../models/user/attendance.model");

const clockIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = new Date(); // current time

    // Prevent clock-in after 10:15 AM
    const cutOffTime = new Date();
    cutOffTime.setHours(10, 15, 0, 0); // 10:15:00 AM today
    if (now > cutOffTime) {
      return res
        .status(400)
        .json({ message: "Clock-in not allowed after 10:15 AM" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      // first clock-in of the day
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        sessions: [{ clockIn: now }],
        isWorking: true,
        status: "present",
      });
    } else {
      const lastSession = attendance.sessions[attendance.sessions.length - 1];
      if (lastSession && !lastSession.clockOut) {
        return res
          .status(400)
          .json({ message: "Already clocked in, please clock out first" });
      }
      attendance.sessions.push({ clockIn: now });
      attendance.isWorking = true;
    }

    await attendance.save();

    res.status(201).json({
      message: "Clock-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Clock-in error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clock Out
const clockOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({ message: "No clock-in record found" });
    }

    const lastSession = attendance.sessions[attendance.sessions.length - 1];
    if (!lastSession || lastSession.clockOut) {
      return res
        .status(400)
        .json({ message: "No active session found to clock out" });
    }

    // Clock out
    lastSession.clockOut = new Date();
    attendance.isWorking = false;

    // Save temporarily to calculate total hours
    await attendance.save();

    // Update status based on totalWorkHours
    // Attendance schema pre-save hook already updates totalWorkHours
    const totalHours = attendance.totalWorkHours;

    if (totalHours < 4) {
      attendance.status = "absent";
    } else if (totalHours >= 4 && totalHours < 7) {
      attendance.status = "half-day";
    } else if (totalHours >= 7) {
      attendance.status = "present"; // full day
    }

    await attendance.save();

    res.json({
      message: "Clock-out successful",
      attendance,
      totalHours,
    });
  } catch (error) {
    console.error("Clock-out error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get Today’s Attendance
const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      return res.json({
        isWorking: false,
        totalWorkedSeconds: 0,
        lastAction: "Not working",
        firstClockIn: null,
        lastClockOut: null,
        workedHours: "00:00:00",
      });
    }

    const lastSession = attendance.sessions[attendance.sessions.length - 1];

    // ✅ calculate total worked ms
    let totalMs = 0;
    attendance.sessions.forEach((s) => {
      if (s.clockIn) {
        if (s.clockOut) {
          totalMs += new Date(s.clockOut) - new Date(s.clockIn);
        } else {
          totalMs += Date.now() - new Date(s.clockIn);
        }
      }
    });

    const totalWorkedSeconds = Math.floor(totalMs / 1000);

    // ✅ derive first clock-in of the day
    const firstClockIn =
      attendance.sessions.find((s) => s.clockIn)?.clockIn || null;

    // ✅ derive last clock-out of the day
    const lastClockOut =
      [...attendance.sessions].reverse().find((s) => s.clockOut)?.clockOut ||
      null;

    // ✅ format total worked time (HH:MM:SS)
    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    };

    res.json({
      isWorking: attendance.isWorking,
      totalWorkedSeconds,
      workedHours: formatTime(totalWorkedSeconds), // static formatted hours
      firstClockIn: firstClockIn
        ? new Date(firstClockIn).toLocaleTimeString()
        : null,
      lastClockOut: lastClockOut
        ? new Date(lastClockOut).toLocaleTimeString()
        : null,
      lastAction: lastSession?.clockIn
        ? lastSession.clockOut
          ? `Clocked out at ${new Date(
              lastSession.clockOut
            ).toLocaleTimeString()}`
          : `Clocked in at ${new Date(
              lastSession.clockIn
            ).toLocaleTimeString()}`
        : "Not working",
    });
  } catch (err) {
    console.error("Get today attendance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all monthly attendance
const getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.query; // month: 1-12
    const employeeId = req.user.id; // from auth middleware

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    // Format into map for easy lookup
    const attendanceMap = {};
    records.forEach((r) => {
      const day = new Date(r.date).getDate();
      attendanceMap[day] = {
        status: r.status,
        totalWorkHours: r.totalWorkHours,
      };
    });

    res.json({ year, month, attendance: attendanceMap });
  } catch (err) {
    console.error("Monthly attendance fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get All Attendance (Admin/HR)
const getAllAttendance = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate("employee", "employeeId name email department role")
      .sort({ date: -1 });

    res.json({ attendances });
  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayAttendance,
  getAllAttendance,
  getMonthlyAttendance,
};
