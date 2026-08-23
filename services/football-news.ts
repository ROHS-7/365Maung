import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  FootballNewsArticle,
  FootballNewsDetailResponse,
  FootballNewsListResponse,
  FootballNewsLoveResponse,
  NewsCategory,
} from '@/types/api';

const MOCK_NEWS: FootballNewsArticle[] = [
  {
    id: 1,
    title: 'Arsenal extend lead at top with late winner',
    content:
      'Arsenal came from behind to beat a resilient opponent 2-1 at the Emirates Stadium on Saturday evening.\n\nThe visitors took a shock lead through a well-worked counter-attack in the 34th minute. Mikel Arteta\'s side responded with increased intensity after the break, equalising before the winner arrived in stoppage time.',
    image_url:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    view_count: 4820,
    love_count: 318,
    is_loved: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'football',
  },
  {
    id: 2,
    title: 'Real Madrid confirm return of star midfielder',
    content:
      'Real Madrid have confirmed that their star midfielder will return to training next week after a lengthy injury layoff.\n\nThe club said medical staff cleared the player for light sessions ahead of the Champions League knockout stage.',
    image_url:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
    view_count: 3100,
    love_count: 210,
    is_loved: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: 'football',
  },
  {
    id: 3,
    title: 'Transfer window: who could move this week?',
    content:
      'Several Premier League clubs are monitoring targets as the window enters its final phase.\n\nAgents have held talks in London and Milan, with at least two deals expected before the deadline.',
    image_url:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    view_count: 8900,
    love_count: 540,
    is_loved: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'football',
  },
  {
    id: 4,
    title: 'International squads lock in for the next major',
    content:
      'Top teams have published preliminary rosters ahead of the upcoming international tournament, with several surprise call-ups.',
    image_url:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    view_count: 2210,
    love_count: 146,
    is_loved: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'esports',
  },
  {
    id: 5,
    title: 'Title bout set after last-minute weigh-in drama',
    content:
      'Both fighters made weight after a tense morning session, clearing the way for Saturday’s main event.',
    image_url:
      'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80',
    view_count: 1750,
    love_count: 98,
    is_loved: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'fight',
  },
];

let cachedNews: FootballNewsArticle[] = [];

export type NewsCategoryFilter = NewsCategory | 'all';

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function resolveNewsCategory(
  raw: unknown,
  fallback: NewsCategory = 'football',
): NewsCategory {
  const r = asRecord(raw);
  const explicit = pickString(
    r.category,
    r.sport,
    r.type,
    r.news_type,
    r.news_category,
  ).toLowerCase();
  if (/(esport|e-sport)/.test(explicit)) return 'esports';
  if (/(fight|box|mma|ufc)/.test(explicit)) return 'fight';
  if (/(foot|soccer)/.test(explicit)) return 'football';
  return fallback;
}

function normalizeNewsArticle(
  raw: unknown,
  fallback: NewsCategory = 'football',
): FootballNewsArticle {
  const r = asRecord(raw);
  const image = pickString(r.image_url, r.image, r.cover_url, r.thumbnail);
  return {
    id: Number(r.id ?? 0),
    title: pickString(r.title, r.name),
    content: typeof r.content === 'string' ? r.content : '',
    image_url: image || null,
    view_count: Number(r.view_count ?? 0),
    love_count: Number(r.love_count ?? 0),
    is_loved: Boolean(r.is_loved),
    created_at: pickString(r.created_at, r.published_at),
    updated_at: pickString(r.updated_at) || undefined,
    category: resolveNewsCategory(r, fallback),
  };
}

export function getCachedNewsArticles(): FootballNewsArticle[] {
  return cachedNews;
}

export function updateCachedNewsArticle(article: FootballNewsArticle) {
  cachedNews = cachedNews.map((item) => (item.id === article.id ? article : item));
  const exists = cachedNews.some((item) => item.id === article.id);
  if (!exists) cachedNews = [article, ...cachedNews];
}

function mockListPage(
  page: number,
  perPage = 15,
  category: NewsCategoryFilter = 'all',
): FootballNewsListResponse {
  const source =
    category === 'all' ? MOCK_NEWS : MOCK_NEWS.filter((n) => n.category === category);
  const total = source.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const news = source.slice(start, start + perPage);
  cachedNews = page === 1 ? news : [...cachedNews, ...news];
  return {
    news,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
  };
}

export async function fetchFootballNews(
  token: string,
  page = 1,
  category: NewsCategoryFilter = 'all',
): Promise<FootballNewsListResponse> {
  if (!API_BASE_URL) {
    return mockListPage(page, 15, category);
  }
  const params = new URLSearchParams({ page: String(page) });
  if (category !== 'all') params.set('category', category);
  const data = await apiRequest<FootballNewsListResponse>(
    `/football/news?${params.toString()}`,
    { token },
  );
  const fallback: NewsCategory = category === 'all' ? 'football' : category;
  const news = (data.news ?? []).map((item) => normalizeNewsArticle(item, fallback));
  if (page === 1) {
    cachedNews = news;
  } else {
    const ids = new Set(cachedNews.map((n) => n.id));
    cachedNews = [...cachedNews, ...news.filter((n) => !ids.has(n.id))];
  }
  return {
    news,
    meta: data.meta,
  };
}

export async function fetchFootballNewsDetail(
  token: string,
  id: number,
): Promise<FootballNewsArticle> {
  if (!API_BASE_URL) {
    const article = MOCK_NEWS.find((n) => n.id === id);
    if (!article) throw new Error('News not found');
    const updated = { ...article, view_count: article.view_count + 1 };
    updateCachedNewsArticle(updated);
    return updated;
  }
  const data = await apiRequest<FootballNewsDetailResponse>(`/football/news/${id}`, { token });
  const article = normalizeNewsArticle(data.news);
  updateCachedNewsArticle(article);
  return article;
}

export async function toggleFootballNewsLove(
  token: string,
  id: number,
): Promise<FootballNewsLoveResponse> {
  if (!API_BASE_URL) {
    const article = cachedNews.find((n) => n.id === id) ?? MOCK_NEWS.find((n) => n.id === id);
    if (!article) throw new Error('News not found');
    const is_loved = !article.is_loved;
    const love_count = article.love_count + (is_loved ? 1 : -1);
    const updated = { ...article, is_loved, love_count: Math.max(0, love_count) };
    updateCachedNewsArticle(updated);
    return {
      message: is_loved ? 'News loved successfully.' : 'Love removed.',
      love_count: updated.love_count,
      is_loved,
    };
  }
  const data = await apiRequest<FootballNewsLoveResponse>(`/football/news/${id}/love`, {
    method: 'POST',
    token,
  });
  const cached = cachedNews.find((n) => n.id === id);
  if (cached) {
    updateCachedNewsArticle({
      ...cached,
      love_count: data.love_count,
      is_loved: data.is_loved,
    });
  }
  return data;
}
