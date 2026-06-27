import { RecentlyViewedItem } from './recentlyViewed.types';

export type UpsertRecentPayload = {
  productId: string;
  viewedAt: number;
};

export type MergeRecentPayload = {
  items: RecentlyViewedItem[];
};

// NOTE:
// Replace endpoint URLs and response parsing based on your backend contract.
// This layer keeps all network logic isolated from UI/business logic.
export const recentlyViewedApi = {
  fetchServerRecentlyViewed: async (): Promise<RecentlyViewedItem[]> => {
    // Example only; wire your actual endpoint.
    // const response = await fetch('/api/recently-viewed', { method: 'GET' });
    // const json = await response.json();
    // return json.items;
    return [];
  },

  upsertServerRecentView: async (_payload: UpsertRecentPayload): Promise<void> => {
    // Example only; wire your actual endpoint.
    // await fetch('/api/recently-viewed', { method: 'POST', body: JSON.stringify(_payload) });
  },

  mergeServerRecentlyViewed: async (_payload: MergeRecentPayload): Promise<RecentlyViewedItem[]> => {
    // Example only; wire your actual endpoint.
    // const response = await fetch('/api/recently-viewed/merge', {
    //   method: 'POST',
    //   body: JSON.stringify(_payload),
    // });
    // const json = await response.json();
    // return json.items;
    return _payload.items;
  },
};
