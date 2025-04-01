const File = require("../models/csv");

module.exports.home = async function (req, res) {
  try {
    let files = await File.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      files: files,
    });
  } catch (error) {
    console.log("Error in homeController/home", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
