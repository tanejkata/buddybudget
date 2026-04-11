const cron = require("node-cron");
const {
  generateDailyInsightsForAllUsers,
} = require("../services/insightGeneration.service");

function startDailyInsightJob() {
  // every day at 8:30 PM server time
  cron.schedule("19 22 * * *", async () => {
    console.log("Running daily AI insight job...");
    await generateDailyInsightsForAllUsers();
  });
}

module.exports = {
  startDailyInsightJob,
};
