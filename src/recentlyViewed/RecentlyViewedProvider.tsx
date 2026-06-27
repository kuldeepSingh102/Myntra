import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { recentlyViewedService } from './recentlyViewed.service';
import { RecentlyViewedItem } from './recentlyViewed.types';

type RecentlyViewedContextValue = {
  items: RecentlyViewedItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  trackView: (productId: string) => Promise<void>;
  onLoginMerge: (userId: string) => Promise<void>;
};

type RecentlyViewedProviderProps = {
  children: React.ReactNode;
  userId?: string | null;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | undefined>(undefined);

export function RecentlyViewedProvider({ children, userId }: RecentlyViewedProviderProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await recentlyViewedService.getRecentlyViewed(userId);
      setItems(next);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trackView = useCallback(
    async (productId: string) => {
      const next = await recentlyViewedService.trackView({ productId, userId });
      setItems(next);
    },
    [userId],
  );

  const onLoginMerge = useCallback(async (nextUserId: string) => {
    const merged = await recentlyViewedService.mergeAnonymousIntoUserAfterLogin(nextUserId);
    setItems(merged);
  }, []);

  const value = useMemo(
    () => ({
      items,
      isLoading,
      refresh,
      trackView,
      onLoginMerge,
    }),
    [items, isLoading, refresh, trackView, onLoginMerge],
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
}
