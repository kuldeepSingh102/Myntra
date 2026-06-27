import AsyncStorage from '@react-native-async-storage/async-storage';

import { RecentlyViewedItem } from './recentlyViewed.types';

const ANON_KEY = 'recently_viewed_anon';
const USER_KEY_PREFIX = 'recently_viewed_user_';

export function getUserRecentlyViewedKey(userId: string): string {
  return `${USER_KEY_PREFIX}${userId}`;
}

async function getParsed(key: string): Promise<RecentlyViewedItem[]> {
  const value = await AsyncStorage.getItem(key);
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as RecentlyViewedItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item => Boolean(item?.productId) && Number.isFinite(item?.viewedAt));
  } catch {
    return [];
  }
}

async function setSerialized(key: string, items: RecentlyViewedItem[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

export const recentlyViewedStorage = {
  getAnonymous: async (): Promise<RecentlyViewedItem[]> => getParsed(ANON_KEY),

  setAnonymous: async (items: RecentlyViewedItem[]): Promise<void> => {
    await setSerialized(ANON_KEY, items);
  },

  clearAnonymous: async (): Promise<void> => {
    await AsyncStorage.removeItem(ANON_KEY);
  },

  getUser: async (userId: string): Promise<RecentlyViewedItem[]> =>
    getParsed(getUserRecentlyViewedKey(userId)),

  setUser: async (userId: string, items: RecentlyViewedItem[]): Promise<void> => {
    await setSerialized(getUserRecentlyViewedKey(userId), items);
  },
};
