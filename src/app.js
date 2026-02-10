const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.use("/users", require("./routes/user.routes"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", time: Date.now() });
});

module.exports = app;
