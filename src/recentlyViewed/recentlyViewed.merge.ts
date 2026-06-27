import {
  RECENTLY_VIEWED_MAX_ITEMS,
  RecentlyViewedItem,
  RecentlyViewedMap,
} from './recentlyViewed.types';

export function normalizeRecentlyViewed(items: RecentlyViewedItem[]): RecentlyViewedItem[] {
  const byProductId: RecentlyViewedMap = {};

  for (const item of items) {
    const existing = byProductId[item.productId];
    if (!existing || item.viewedAt > existing.viewedAt) {
      byProductId[item.productId] = item;
    }
  }

  return Object.values(byProductId)
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, RECENTLY_VIEWED_MAX_ITEMS);
}

export function mergeRecentlyViewed(
  localItems: RecentlyViewedItem[],
  serverItems: RecentlyViewedItem[],
): RecentlyViewedItem[] {
  return normalizeRecentlyViewed([...localItems, ...serverItems]);
}

export function addOrUpdateRecentItem(
  items: RecentlyViewedItem[],
  nextItem: RecentlyViewedItem,
): RecentlyViewedItem[] {
  return normalizeRecentlyViewed([nextItem, ...items]);
}
