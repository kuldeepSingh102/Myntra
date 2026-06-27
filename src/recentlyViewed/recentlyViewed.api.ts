import { RecentlyViewedItem } from './recentlyViewed.types';

export type UpsertRecentPayload = {
  userId: string;
  productId: string;
  viewedAt: number;
};

export type MergeRecentPayload = {
  userId: string;
  items: RecentlyViewedItem[];
};

const API_BASE_URL = 'http://localhost:5000';

type RecentlyViewedResponse = {
  items: Array<{
    productId: string;
    viewedAt: string | number;
  }>;
};

function toClientItems(data: RecentlyViewedResponse): RecentlyViewedItem[] {
  return (data.items || []).map(item => ({
    productId: String(item.productId),
    viewedAt: new Date(item.viewedAt).getTime(),
    source: 'server',
  }));
}

export const recentlyViewedApi = {
  fetchServerRecentlyViewed: async (userId: string): Promise<RecentlyViewedItem[]> => {
    const response = await fetch(`${API_BASE_URL}/recently-viewed/${userId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch server recently viewed');
    }

    const json = (await response.json()) as RecentlyViewedResponse;
    return toClientItems(json);
  },

  upsertServerRecentView: async (payload: UpsertRecentPayload): Promise<RecentlyViewedItem[]> => {
    const response = await fetch(`${API_BASE_URL}/recently-viewed/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to upsert recent view');
    }

    const json = (await response.json()) as RecentlyViewedResponse;
    return toClientItems(json);
  },

  mergeServerRecentlyViewed: async (payload: MergeRecentPayload): Promise<RecentlyViewedItem[]> => {
    const response = await fetch(`${API_BASE_URL}/recently-viewed/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: payload.userId,
        items: payload.items.map(item => ({
          productId: item.productId,
          viewedAt: item.viewedAt,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to merge recently viewed');
    }

    const json = (await response.json()) as RecentlyViewedResponse;
    return toClientItems(json);
  },
};
