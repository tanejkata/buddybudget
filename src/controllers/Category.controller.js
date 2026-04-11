const Category = require("../models/Category.model.js");

exports.getCategories = async (req, res) => {
  try {
    const { userId, type } = req.query;

    const query = {
      $or: [{ isDefault: true }, { userId }],
    };

    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ isDefault: -1, name: 1 });

    return res.status(200).json({
      message: "Categories fetched successfully",
      data: {
        categories,
      },
    });
  } catch (error) {
    console.log("Get categories error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type, userId } = req.body;

    if (!name || !type || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedName = name.trim();

    const existing = await Category.findOne({
      name: new RegExp(`^${normalizedName}$`, "i"),
      type,
      $or: [{ isDefault: true }, { userId }],
    });

    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: normalizedName,
      type,
      userId,
      isDefault: false,
    });

    return res.status(201).json({
      message: "Category created successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    console.log("Create category error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.isDefault) {
      return res.status(400).json({ message: "Default category cannot be deleted" });
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("Delete category error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};