import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  FightMatch,
  FightMatchResult,
  FightMatchResultsResponse,
  FightMatchesResponse,
} from '@/types/fight';

const MOCK_MATCHES: FightMatchesResponse = {
  matches: [
    {
      id: 80,
      match_id: 49656279,
      sport: 'fight',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      to_win_odds: { home: 1.58, away: 2.38 },
      home_result: null,
      away_result: null,
      is_show: true,
      is_settle: false,
      home: { id: 20, name: 'Anthony Hernandez', name_en: 'Anthony Hernandez' },
      away: { id: 21, name: 'Gregory Rodrigues', name_en: 'Gregory Rodrigues' },
      league: { id: 9, name: 'UFC FIGHT NIGHT' },
    },
  ],
};

function normalizeTeam(raw: unknown): FightMatch['home'] {
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

function normalizeMatch(raw: unknown): FightMatch {
  const m = (raw ?? {}) as Record<string, unknown>;
  const odds = (m.to_win_odds ?? {}) as Record<string, unknown>;
  return {
    id: Number(m.id ?? 0),
    match_id: Number(m.match_id ?? 0),
    sport: typeof m.sport === 'string' ? m.sport : 'fight',
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

export async function fetchFightMatches(
  token: string,
): Promise<FightMatchesResponse> {
  if (!API_BASE_URL) return MOCK_MATCHES;
  const data = await apiRequest<FightMatchesResponse>('/fight/matches', {
    token,
  });
  return {
    matches: (data.matches ?? []).map(normalizeMatch),
  };
}

const MOCK_RESULTS: FightMatchResultsResponse = {
  matches: [
    {
      id: 80,
      match_id: 49656279,
      sport: 'fight',
      home_result: 6,
      away_result: 0,
      is_settle: true,
      home: { id: 20, name: 'Anthony Hernandez', name_en: 'Anthony Hernandez' },
      away: { id: 21, name: 'Gregory Rodrigues', name_en: 'Gregory Rodrigues' },
      league: { id: 9, name: 'UFC FIGHT NIGHT' },
    },
  ],
};

function normalizeMatchResult(raw: unknown): FightMatchResult {
  const m = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(m.id ?? 0),
    match_id: Number(m.match_id ?? 0),
    sport: typeof m.sport === 'string' ? m.sport : 'fight',
    match_time: typeof m.match_time === 'string' ? m.match_time : undefined,
    home_result: Number(m.home_result),
    away_result: Number(m.away_result),
    is_settle: Boolean(m.is_settle),
    home: normalizeTeam(m.home),
    away: normalizeTeam(m.away),
    league: {
      id: Number((m.league as { id?: number } | undefined)?.id ?? 0),
      name: String((m.league as { name?: string } | undefined)?.name ?? ''),
    },
  };
}

export async function fetchFightMatchResults(
  token: string,
): Promise<FightMatchResultsResponse> {
  if (!API_BASE_URL) return MOCK_RESULTS;
  const data = await apiRequest<FightMatchResultsResponse>(
    '/fight/matches/results',
    { token },
  );
  return {
    matches: (data.matches ?? [])
      .map(normalizeMatchResult)
      .filter(
        (m) =>
          Number.isFinite(m.home_result) && Number.isFinite(m.away_result),
      ),
  };
}
