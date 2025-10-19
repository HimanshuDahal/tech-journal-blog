const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Linux", "Web Dev", "Security", "Automation", "Other"],
      default: "Other",
    },
    tags: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
postSchema.index({ title: "text", content: "text", tags: 1 });
