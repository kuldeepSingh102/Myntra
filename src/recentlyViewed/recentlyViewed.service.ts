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
        const serverCanonical = await recentlyViewedApi.upsertServerRecentView({
          userId,
          productId,
          viewedAt: timestamp,
        });

        const merged = mergeRecentlyViewed(nextLocal, serverCanonical);
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
    const serverItems = await recentlyViewedApi.fetchServerRecentlyViewed(userId);
    const merged = mergeRecentlyViewed(localUserItems, serverItems);
    await recentlyViewedStorage.setUser(userId, merged);
    return merged;
  },

  mergeAnonymousIntoUserAfterLogin: async (userId: string): Promise<RecentlyViewedItem[]> => {
    const anonItems = await recentlyViewedStorage.getAnonymous();
    const userItems = await recentlyViewedStorage.getUser(userId);

    const serverItems = await recentlyViewedApi.fetchServerRecentlyViewed(userId);
    const mergedLocal = mergeRecentlyViewed(mergeRecentlyViewed(anonItems, userItems), serverItems);

    const mergedServer = await recentlyViewedApi.mergeServerRecentlyViewed({
      userId,
      items: mergedLocal,
    });

    const canonical = mergeRecentlyViewed(mergedLocal, mergedServer);

    await recentlyViewedStorage.setUser(userId, canonical);
    await recentlyViewedStorage.clearAnonymous();

    return canonical;
  },
};
