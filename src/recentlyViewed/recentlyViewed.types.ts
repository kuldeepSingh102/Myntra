export const RECENTLY_VIEWED_MAX_ITEMS = 20;

export type RecentlyViewedItem = {
  productId: string;
  viewedAt: number;
  source?: 'local' | 'server';
};

export type RecentlyViewedMap = Record<string, RecentlyViewedItem>;
