require("dotenv").config();
const express = require("express");
const user = require("./routers/user/employee.routes");
const DB_Connection = require("./database/mongoDB");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const attendance = require("./routers/user/attendance.route");

const app = express();

const corsOptions = {
  origin: "https://a2zinsure.in",
  credentials: true,
};
// middleware

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use("/api/v1", user);
app.use("/api/v1", attendance);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello everyone!");
});

DB_Connection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
  });
