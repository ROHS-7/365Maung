import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { NEWS_ARTICLES } from '@/constants/news';

type Engagement = { views: number; likes: number; liked: boolean };

type NewsEngagementContextType = {
  getEngagement: (id: string) => Engagement;
  recordView: (id: string) => void;
  toggleLike: (id: string) => void;
};

const NewsEngagementContext = createContext<NewsEngagementContextType | null>(
  null,
);

function buildInitial(): Record<string, Engagement> {
  return Object.fromEntries(
    NEWS_ARTICLES.map(a => [
      a.id,
      { views: a.views, likes: a.likes, liked: false },
    ]),
  );
}

export function NewsEngagementProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, Engagement>>(buildInitial);
  const viewedRef = useMemo(() => ({ current: new Set<string>() }), []);

  const getEngagement = useCallback(
    (id: string) => data[id] ?? { views: 0, likes: 0, liked: false },
    [data],
  );

  const recordView = useCallback(
    (id: string) => {
      if (viewedRef.current.has(id)) return;
      viewedRef.current.add(id);
      setData(prev => {
        const row = prev[id];
        if (!row) return prev;
        return { ...prev, [id]: { ...row, views: row.views + 1 } };
      });
    },
    [viewedRef],
  );

  const toggleLike = useCallback((id: string) => {
    setData(prev => {
      const row = prev[id];
      if (!row) return prev;
      const liked = !row.liked;
      return {
        ...prev,
        [id]: {
          ...row,
          liked,
          likes: row.likes + (liked ? 1 : -1),
        },
      };
    });
  }, []);

  const value = useMemo(
    () => ({ getEngagement, recordView, toggleLike }),
    [getEngagement, recordView, toggleLike],
  );

  return (
    <NewsEngagementContext.Provider value={value}>
      {children}
    </NewsEngagementContext.Provider>
  );
}

export function useNewsEngagement() {
  const ctx = useContext(NewsEngagementContext);
  if (!ctx) {
    throw new Error('useNewsEngagement must be used within NewsEngagementProvider');
  }
  return ctx;
}
