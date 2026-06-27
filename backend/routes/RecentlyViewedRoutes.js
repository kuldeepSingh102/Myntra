const express = require("express");
const mongoose = require("mongoose");
const RecentlyViewed = require("../models/RecentlyViewed");

const router = express.Router();

const MAX_ITEMS = 20;

function toObjectId(value) {
  return new mongoose.Types.ObjectId(value);
}

function normalizeByProductLatest(items) {
  const map = new Map();

  for (const item of items) {
    const productIdString = String(item.productId);
    const viewedAtDate = item.viewedAt instanceof Date ? item.viewedAt : new Date(item.viewedAt);

    if (!Number.isFinite(viewedAtDate.getTime())) {
      continue;
    }

    const existing = map.get(productIdString);
    if (!existing || viewedAtDate.getTime() > new Date(existing.viewedAt).getTime()) {
      map.set(productIdString, {
        productId: productIdString,
        viewedAt: viewedAtDate,
      });
    }
  }

  return [...map.values()]
    .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
    .slice(0, MAX_ITEMS);
}

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const items = await RecentlyViewed.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(MAX_ITEMS)
      .populate("productId");

    return res.status(200).json({
      items: items.map(item => ({
        productId: item.productId?._id || item.productId,
        product: item.productId,
        viewedAt: item.viewedAt,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/view", async (req, res) => {
  try {
    const { userId, productId, viewedAt } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const nextViewedAt = viewedAt ? new Date(viewedAt) : new Date();
    if (!Number.isFinite(nextViewedAt.getTime())) {
      return res.status(400).json({ message: "Invalid viewedAt" });
    }

    await RecentlyViewed.findOneAndUpdate(
      { userId: toObjectId(userId), productId: toObjectId(productId) },
      {
        $max: { viewedAt: nextViewedAt },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const allItems = await RecentlyViewed.find({ userId }).sort({ viewedAt: -1 });
    const normalized = normalizeByProductLatest(allItems);

    if (allItems.length > MAX_ITEMS) {
      const keepSet = new Set(normalized.map(item => item.productId));
      const removableIds = allItems
        .filter(row => !keepSet.has(String(row.productId)))
        .map(row => row._id);

      if (removableIds.length) {
        await RecentlyViewed.deleteMany({ _id: { $in: removableIds } });
      }
    }

    const finalItems = await RecentlyViewed.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(MAX_ITEMS)
      .populate("productId");

    return res.status(200).json({
      items: finalItems.map(item => ({
        productId: item.productId?._id || item.productId,
        product: item.productId,
        viewedAt: item.viewedAt,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/merge", async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ message: "userId and items[] are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const serverItems = await RecentlyViewed.find({ userId });

    const merged = normalizeByProductLatest([
      ...serverItems.map(row => ({ productId: row.productId, viewedAt: row.viewedAt })),
      ...items,
    ]);

    const bulkOps = merged
      .filter(item => mongoose.Types.ObjectId.isValid(String(item.productId)))
      .map(item => ({
        updateOne: {
          filter: {
            userId: toObjectId(userId),
            productId: toObjectId(String(item.productId)),
          },
          update: {
            $set: {
              viewedAt: new Date(item.viewedAt),
            },
          },
          upsert: true,
        },
      }));

    if (bulkOps.length) {
      await RecentlyViewed.bulkWrite(bulkOps, { ordered: false });
    }

    const keepSet = new Set(merged.map(item => String(item.productId)));
    await RecentlyViewed.deleteMany({
      userId: toObjectId(userId),
      productId: { $nin: [...keepSet].map(id => toObjectId(id)) },
    });

    const finalItems = await RecentlyViewed.find({ userId })
      .sort({ viewedAt: -1 })
      .limit(MAX_ITEMS)
      .populate("productId");

    return res.status(200).json({
      items: finalItems.map(item => ({
        productId: item.productId?._id || item.productId,
        product: item.productId,
        viewedAt: item.viewedAt,
      })),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
