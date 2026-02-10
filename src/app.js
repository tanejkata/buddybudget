const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", time: Date.now() });
});

module.exports = app;
