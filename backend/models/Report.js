const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },

    extractedText: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
