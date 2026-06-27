import { recentlyViewedApi } from './recentlyViewed.api';
import { addOrUpdateRecentItem, mergeRecentlyViewed, normalizeRecentlyViewed } from './recentlyViewed.merge';
import { recentlyViewedStorage } from './recentlyViewed.storage';
import { RecentlyViewedItem } from './recentlyViewed.types';

type TrackViewParams = {
  productId: string;
  userId?: string | null;
  viewedAt?: number;
};

export const recentlyViewedService = {
  getRecentlyViewed: async (userId?: string | null): Promise<RecentlyViewedItem[]> => {
    if (userId) {
      return normalizeRecentlyViewed(await recentlyViewedStorage.getUser(userId));
    }

    return normalizeRecentlyViewed(await recentlyViewedStorage.getAnonymous());
  },

  trackView: async ({ productId, userId, viewedAt }: TrackViewParams): Promise<RecentlyViewedItem[]> => {
    const timestamp = viewedAt ?? Date.now();
    const nextItem: RecentlyViewedItem = {
      productId,
      viewedAt: timestamp,
      source: 'local',
    };

    if (userId) {
      const currentUserItems = await recentlyViewedStorage.getUser(userId);
      const nextLocal = addOrUpdateRecentItem(currentUserItems, nextItem);
      await recentlyViewedStorage.setUser(userId, nextLocal);

      try {
        await recentlyViewedApi.upsertServerRecentView({ productId, viewedAt: timestamp });
        const serverItems = await recentlyViewedApi.fetchServerRecentlyViewed();
        const merged = mergeRecentlyViewed(nextLocal, serverItems);
        await recentlyViewedStorage.setUser(userId, merged);
        return merged;
      } catch {
        return nextLocal;
      }
    }

    const currentAnonItems = await recentlyViewedStorage.getAnonymous();
    const nextAnon = addOrUpdateRecentItem(currentAnonItems, nextItem);
    await recentlyViewedStorage.setAnonymous(nextAnon);
    return nextAnon;
  },

  syncFromServer: async (userId: string): Promise<RecentlyViewedItem[]> => {
    const localUserItems = await recentlyViewedStorage.getUser(userId);
    const serverItems = await recentlyViewedApi.fetchServerRecentlyViewed();
    const merged = mergeRecentlyViewed(localUserItems, serverItems);
    await recentlyViewedStorage.setUser(userId, merged);
    return merged;
  },

  mergeAnonymousIntoUserAfterLogin: async (userId: string): Promise<RecentlyViewedItem[]> => {
    const anonItems = await recentlyViewedStorage.getAnonymous();
    const userItems = await recentlyViewedStorage.getUser(userId);

    // Include server snapshot to handle concurrent multi-device updates.
    const serverItems = await recentlyViewedApi.fetchServerRecentlyViewed();
    const mergedLocal = mergeRecentlyViewed(mergeRecentlyViewed(anonItems, userItems), serverItems);

    // Send merged list to backend (idempotent upsert/merge endpoint expected).
    const mergedServer = await recentlyViewedApi.mergeServerRecentlyViewed({ items: mergedLocal });
    const canonical = mergeRecentlyViewed(mergedLocal, mergedServer);

    await recentlyViewedStorage.setUser(userId, canonical);
    await recentlyViewedStorage.clearAnonymous();

    return canonical;
  },
};
