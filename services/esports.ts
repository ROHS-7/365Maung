import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  EsportsMatch,
  EsportsMatchResult,
  EsportsMatchResultsResponse,
  EsportsMatchesResponse,
} from '@/types/esports';

const MOCK_MATCHES: EsportsMatchesResponse = {
  matches: [
    {
      id: 51,
      match_id: 49370695,
      sport: 'esports',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      to_win_odds: { home: 1.83, away: 1.88 },
      home_result: null,
      away_result: null,
      is_show: true,
      is_settle: false,
      home: { id: 10, name: 'Nemiga Gaming', name_en: 'Nemiga Gaming' },
      away: { id: 11, name: 'Ilbirs eSports', name_en: 'Ilbirs eSports' },
      league: { id: 5, name: 'DOTA 2 - EPL MASTERS 1 (PLAY-IN)' },
    },
    {
      id: 52,
      match_id: 49370696,
      sport: 'esports',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      to_win_odds: { home: 2.1, away: 1.65 },
      home_result: null,
      away_result: null,
      is_show: true,
      is_settle: false,
      home: { id: 20, name: 'Team Spirit', name_en: 'Team Spirit' },
      away: { id: 21, name: 'Gaimin Gladiators', name_en: 'Gaimin Gladiators' },
      league: { id: 5, name: 'DOTA 2 - EPL MASTERS 1 (PLAY-IN)' },
    },
  ],
};

function normalizeTeam(raw: unknown): EsportsMatch['home'] {
  if (!raw || typeof raw !== 'object') {
    return { id: 0, name: '', name_en: '' };
  }
  const t = raw as Record<string, unknown>;
  const nameEn =
    typeof t.name_en === 'string'
      ? t.name_en
      : typeof t.nameEn === 'string'
        ? t.nameEn
        : '';
  return {
    id: typeof t.id === 'number' ? t.id : 0,
    name: typeof t.name === 'string' ? t.name : '',
    name_en: nameEn,
  };
}

function normalizeMatch(raw: unknown): EsportsMatch {
  const m = (raw ?? {}) as Record<string, unknown>;
  const odds = (m.to_win_odds ?? {}) as Record<string, unknown>;
  return {
    id: Number(m.id ?? 0),
    match_id: Number(m.match_id ?? 0),
    sport: typeof m.sport === 'string' ? m.sport : 'esports',
    draw_date: String(m.draw_date ?? ''),
    match_time: String(m.match_time ?? ''),
    to_win_odds: {
      home: Number(odds.home ?? NaN),
      away: Number(odds.away ?? NaN),
    },
    home_result: m.home_result == null ? null : Number(m.home_result),
    away_result: m.away_result == null ? null : Number(m.away_result),
    is_show: Boolean(m.is_show),
    is_settle: Boolean(m.is_settle),
    home: normalizeTeam(m.home),
    away: normalizeTeam(m.away),
    league: {
      id: Number((m.league as { id?: number } | undefined)?.id ?? 0),
      name: String((m.league as { name?: string } | undefined)?.name ?? ''),
    },
  };
}

export async function fetchEsportsMatches(
  token: string,
  drawDate?: string,
): Promise<EsportsMatchesResponse> {
  if (!API_BASE_URL) return MOCK_MATCHES;
  const q = drawDate ? `?draw_date=${drawDate}` : '';
  const data = await apiRequest<EsportsMatchesResponse>(`/esports/matches${q}`, {
    token,
  });
  return {
    matches: (data.matches ?? []).map(normalizeMatch),
  };
}

const MOCK_RESULTS: EsportsMatchResultsResponse = {
  matches: [
    {
      id: 51,
      match_id: 49370695,
      sport: 'esports',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      home_result: 2,
      away_result: 0,
      is_settle: true,
      home: { id: 10, name: 'Nemiga Gaming', name_en: 'Nemiga Gaming' },
      away: { id: 11, name: 'Ilbirs eSports', name_en: 'Ilbirs eSports' },
      league: { id: 5, name: 'DOTA 2 - EPL MASTERS 1 (PLAY-IN)' },
    },
    {
      id: 52,
      match_id: 49370696,
      sport: 'esports',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      home_result: 1,
      away_result: 2,
      is_settle: true,
      home: { id: 20, name: 'Team Spirit', name_en: 'Team Spirit' },
      away: { id: 21, name: 'Gaimin Gladiators', name_en: 'Gaimin Gladiators' },
      league: { id: 5, name: 'DOTA 2 - EPL MASTERS 1 (PLAY-IN)' },
    },
  ],
};

function normalizeMatchResult(raw: unknown): EsportsMatchResult {
  const m = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(m.id ?? 0),
    match_id: Number(m.match_id ?? 0),
    sport: typeof m.sport === 'string' ? m.sport : 'esports',
    draw_date: String(m.draw_date ?? ''),
    match_time: String(m.match_time ?? ''),
    home_result: Number(m.home_result ?? 0),
    away_result: Number(m.away_result ?? 0),
    is_settle: Boolean(m.is_settle),
    home: normalizeTeam(m.home),
    away: normalizeTeam(m.away),
    league: {
      id: Number((m.league as { id?: number } | undefined)?.id ?? 0),
      name: String((m.league as { name?: string } | undefined)?.name ?? ''),
    },
  };
}

export async function fetchEsportsMatchResults(
  token: string,
  drawDate?: string,
): Promise<EsportsMatchResultsResponse> {
  if (!API_BASE_URL) return MOCK_RESULTS;
  const q = drawDate ? `?draw_date=${drawDate}` : '';
  const data = await apiRequest<EsportsMatchResultsResponse>(
    `/esports/matches/results${q}`,
    { token },
  );
  return {
    matches: (data.matches ?? [])
      .map(normalizeMatchResult)
      .filter(
        (m) =>
          Number.isFinite(m.home_result) &&
          Number.isFinite(m.away_result) &&
          m.home_result != null &&
          m.away_result != null,
      ),
  };
}
