# Hybrid Recently Viewed with Cross-Device Sync

This module implements an end-to-end architecture for recently viewed products with local-first UX and server synchronization.

## Requirements covered

- Local storage for fast access
- Cross-device server sync for authenticated users
- Duplicate prevention by `productId`
- Maximum 20 items
- Most-recent-first ordering by `viewedAt`
- Anonymous-to-auth login merge (local + server) without duplication
- Concurrency-safe strategy (server as source of truth + idempotent merge/upsert)

## Files

- `src/recentlyViewed/recentlyViewed.types.ts`
- `src/recentlyViewed/recentlyViewed.storage.ts`
- `src/recentlyViewed/recentlyViewed.merge.ts`
- `src/recentlyViewed/recentlyViewed.api.ts`
- `src/recentlyViewed/recentlyViewed.service.ts`
- `src/recentlyViewed/RecentlyViewedProvider.tsx`
- `src/recentlyViewed/index.ts`

## Flow

1. Product open event -> `trackView(productId)`
2. Save immediately in AsyncStorage (anonymous or user bucket)
3. If logged in: send upsert to server, fetch server list, merge and persist locally
4. On login after anonymous browsing: merge anon + user + server, push merge to server, persist canonical list, clear anon data

## Integration example

```tsx
import React from 'react';
import { RecentlyViewedProvider } from './src/recentlyViewed';

export default function App() {
  const userId = null; // replace with auth state

  return (
    <RecentlyViewedProvider userId={userId}>
      {/* app content */}
    </RecentlyViewedProvider>
  );
}
```

### Tracking a view from Product Details screen

```tsx
import { useEffect } from 'react';
import { useRecentlyViewed } from '../recentlyViewed';

function ProductDetails({ productId }: { productId: string }) {
  const { trackView } = useRecentlyViewed();

  useEffect(() => {
    void trackView(productId);
  }, [productId, trackView]);

  return null;
}
```

### On login merge call

```tsx
import { useRecentlyViewed } from '../recentlyViewed';

async function onLoginSuccess(userId: string) {
  const { onLoginMerge } = useRecentlyViewed();
  await onLoginMerge(userId);
}
```

## Backend contract expectations

- `upsertServerRecentView({ productId, viewedAt })`
  - Unique key: `(userId, productId)`
  - Conflict resolution: newest `viewedAt` wins
- `fetchServerRecentlyViewed()`
  - Returns top 20, sorted desc by `viewedAt`
- `mergeServerRecentlyViewed({ items })`
  - Idempotent merge
  - Returns canonical recent list

## Notes

- Replace `recentlyViewed.api.ts` placeholders with your real API endpoints.
- If server returns authoritative timestamps, merge logic already supports latest timestamp wins.
