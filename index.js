require("dotenv").config();
const express = require("express");
const user = require("./routers/user/employee.routes");
const DB_Connection = require("./database/mongoDB");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const attendance = require("./routers/user/attendance.route");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1", user);
app.use("/api/v1", attendance);

const PORT = process.env.PORT || 5000;

DB_Connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
  });
