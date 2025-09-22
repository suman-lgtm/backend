const express = require("express");
const authMiddleware = require("../../middleware/auth.middleware");
const {
  clockIn,
  clockOut,
  getTodayAttendance,
  getMonthlyAttendance,
} = require("../../controllers/user/attendance.controller");

const router = express.Router();

router.route("/clock-in").post(authMiddleware, clockIn);
router.route("/clock-out").post(authMiddleware, clockOut);
router.get("/attendance/today", authMiddleware, getTodayAttendance);
router.get("/attendance/month", authMiddleware, getMonthlyAttendance);

module.exports = router;
