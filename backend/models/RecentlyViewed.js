const mongoose = require("mongoose");

const RecentlyViewedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    viewedAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

RecentlyViewedSchema.index({ userId: 1, productId: 1 }, { unique: true });
RecentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

module.exports = mongoose.model("RecentlyViewed", RecentlyViewedSchema);
