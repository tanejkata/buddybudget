require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const seedCategories = require("./constants/categories"); // adjust path

const PORT = process.env.PORT || 5050;
const { startDailyInsightJob } = require("../src/jobs/corn.job");

mongoose
  .connect(process.env.MONGO_URI, {
    family: 4,
  })
  .then(async () => {
    console.log("MongoDB connected");

    await seedCategories();
    startDailyInsightJob();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
