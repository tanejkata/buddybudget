const Insight = require("../models/Insight.model");
const { generateDailyInsightForUser } = require("../services/insightGeneration.service");

exports.getInsights = async (req, res) => {
  try {
    const { userId } = req.params;

    const insights = await Insight.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        insights,
      },
    });
  } catch (error) {
    console.log("Get insights error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch insights",
    });
  }
};

exports.markInsightRead = async (req, res) => {
  try {
    const insight = await Insight.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        insight,
      },
    });
  } catch (error) {
    console.log("Mark insight read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update insight",
    });
  }
};

exports.generateTodayInsight = async (req, res) => {
  try {
    const { userId } = req.params;
    const insight = await generateDailyInsightForUser(userId);

    return res.status(200).json({
      success: true,
      data: {
        insight,
      },
    });
  } catch (error) {
    console.log("Generate daily insight error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate insight",
    });
  }
};