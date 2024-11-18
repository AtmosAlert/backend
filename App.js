var cors = require("cors");

const express = require("express");
const app = express();

const AuthRoute = require("./routes/auth");
const authenticate = require("./middlewares/Authenticate");
const UsersRoute = require("./routes/users");

app.use(cors());
app.use(express.json());

app.use("/auth", AuthRoute);
app.use("/api/user", authenticate.authenticate, UsersRoute);

app.get("/verifyToken", authenticate.authenticate, async (req, res) => {
  res.status(200).json({
    message: "Authentication Succeed",
    valid: true,
  });
});

module.exports = app;
