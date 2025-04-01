const mongoose = require("mongoose");

const sheetVisibilitySchema = new mongoose.Schema({
  sheetName: {
    type: String,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const csvSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    isMarkedForDeletion: {
      type: Boolean,
      default: false,
    },
    sheetVisibility: [sheetVisibilitySchema],
  },
  {
    timestamps: true,
  }
);

const CSV = mongoose.model("CSV", csvSchema);
module.exports = CSV;