import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  BetSlip,
  BetSlipLeg,
  BetSlipResponse,
  BetSlipsQuery,
  BetSlipsResponse,
  FootballLeague,
  FootballMatchResult,
  FootballMatchResultsResponse,
  FootballMatchesResponse,
  FootballTeam,
  SubmitBetSlipPayload,
} from '@/types/football';

const MOCK_MATCHES: FootballMatchesResponse = {
  matches: [
    {
      id: 1,
      match_id: 12345,
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      single_odds: '0',
      single_goal_odds: '2=',
      mix_odds: '0/0.5',
      mix_goal_odds: '2.5=',
      single_fh_odds: '0',
      mix_fh_odds: '0/0.5',
      single_fh_goal_odds: '1=',
      mix_fh_goal_odds: '1.5=',
      one_x_two_odds: { home: 1.85, draw: 3.4, away: 4.2 },
      correct_score_odds: { '1-0': 7.5, '2-1': 8.5, '2-0': 9.0, AOS: 20.0 },
      sone_ma_odds: { sone: 0.91, ma: 0.99 },
      home_result: null,
      away_result: null,
      home_ht_result: null,
      away_ht_result: null,
      is_show: true,
      is_major: true,
      is_settle: false,
      is_ht_settle: false,
      home: { id: 10, name: 'Man U', name_en: 'Man U' },
      away: { id: 11, name: 'Chelsea', name_en: 'Chelsea' },
      odds_team: { id: 10, name: 'Man U', name_en: 'Man U' },
      fh_odds_team: { id: 10, name: 'Man U', name_en: 'Man U' },
      league: { id: 1, name: 'PREMIER LEAGUE' },
    },
    {
      id: 2,
      match_id: 12346,
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      single_odds: '1',
      single_goal_odds: '2=',
      mix_odds: '1',
      mix_goal_odds: '2=',
      single_fh_odds: '0.5',
      mix_fh_odds: '0.5',
      single_fh_goal_odds: '0.5=',
      mix_fh_goal_odds: '1=',
      one_x_two_odds: { home: 2.1, draw: 3.2, away: 3.5 },
      correct_score_odds: { '1-0': 6.5, '1-1': 5.5, AOS: 18.0 },
      sone_ma_odds: { sone: 0.95, ma: 0.95 },
      home_result: null,
      away_result: null,
      home_ht_result: null,
      away_ht_result: null,
      is_show: true,
      is_major: false,
      is_settle: false,
      is_ht_settle: false,
      home: { id: 20, name: 'Liverpool', name_en: 'Liverpool' },
      away: { id: 21, name: 'Man City', name_en: 'Man City' },
      odds_team: { id: 20, name: 'Liverpool', name_en: 'Liverpool' },
      fh_odds_team: { id: 21, name: 'Man City', name_en: 'Man City' },
      league: { id: 1, name: 'PREMIER LEAGUE' },
    },
    {
      id: 3,
      match_id: 12347,
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      single_odds: '0',
      single_goal_odds: '2.5=',
      mix_odds: '0',
      mix_goal_odds: '2.5=',
      single_fh_odds: '0',
      mix_fh_odds: '0',
      single_fh_goal_odds: '1=',
      mix_fh_goal_odds: '1=',
      one_x_two_odds: { home: 1.7, draw: 3.6, away: 4.8 },
      correct_score_odds: { '2-0': 8.0, '2-1': 7.0, AOS: 22.0 },
      sone_ma_odds: { sone: 0.9, ma: 1.0 },
      home_result: null,
      away_result: null,
      home_ht_result: null,
      away_ht_result: null,
      is_show: true,
      is_major: false,
      is_settle: false,
      is_ht_settle: false,
      home: { id: 30, name: 'Boca Juniors', name_en: 'Boca Juniors' },
      away: { id: 31, name: 'River Plate', name_en: 'River Plate' },
      odds_team: { id: 30, name: 'Boca Juniors', name_en: 'Boca Juniors' },
      fh_odds_team: { id: 30, name: 'Boca Juniors', name_en: 'Boca Juniors' },
      league: { id: 2, name: 'ARGENTINA CUP' },
    },
  ],
};

let mockSlips: BetSlip[] = [];
let cachedSlips: BetSlip[] = [];

function normalizeTeam(raw: unknown): FootballTeam {
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

function normalizeLeague(raw: unknown): FootballLeague {
  if (!raw || typeof raw !== 'object') {
    return { id: 0, name: '' };
  }
  const l = raw as Record<string, unknown>;
  return {
    id: typeof l.id === 'number' ? l.id : 0,
    name: typeof l.name === 'string' ? l.name : '',
  };
}

function normalizeLeg(raw: unknown, slipSport?: string): BetSlipLeg {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      bet_amount: 0,
      odds: '',
      goal_odds: null,
      is_bingo: false,
      is_cancel: false,
      home: { id: 0, name: '', name_en: '' },
      away: { id: 0, name: '', name_en: '' },
      selected_team: { id: 0, name: '', name_en: '' },
      league: { id: 0, name: '' },
    };
  }

  const r = raw as Record<string, unknown>;
  const match = r.match as Record<string, unknown> | undefined;
  const home = normalizeTeam(r.home ?? r.home_team ?? match?.home);
  const away = normalizeTeam(r.away ?? r.away_team ?? match?.away);
  let selected = normalizeTeam(r.selected_team ?? r.selectedTeam);

  if (!selected.name && selected.id) {
    if (selected.id === home.id && home.name) selected = { ...home };
    else if (selected.id === away.id && away.name) selected = { ...away };
  }

  const goalUpDown = r.goal_up_down;
  const soneMa = r.sone_ma;
  const marketRaw = typeof r.market === 'string' ? r.market : null;
  const selectionRaw = typeof r.selection === 'string' ? r.selection : null;
  const sportRaw =
    typeof r.sport === 'string'
      ? r.sport
      : typeof match?.sport === 'string'
        ? match.sport
        : slipSport;

  return {
    id: Number(r.id ?? 0),
    bet_amount: Number(r.bet_amount ?? 0),
    odds: String(r.odds ?? ''),
    goal_odds: r.goal_odds != null ? String(r.goal_odds) : null,
    market: marketRaw as BetSlipLeg['market'],
    selection: selectionRaw,
    goal_up_down:
      goalUpDown === 'up' || goalUpDown === 'down' ? goalUpDown : null,
    sone_ma: soneMa === 'sone' || soneMa === 'ma' ? soneMa : null,
    is_bingo: Boolean(r.is_bingo),
    is_cancel: Boolean(r.is_cancel),
    home,
    away,
    selected_team: selected,
    league: normalizeLeague(r.league),
    sport: sportRaw,
    match: match
      ? {
          home: normalizeTeam(match.home),
          away: normalizeTeam(match.away),
          sport: typeof match.sport === 'string' ? match.sport : sportRaw,
        }
      : undefined,
  };
}

function normalizeBetSlip(raw: unknown): BetSlip {
  const r = (raw ?? {}) as Record<string, unknown>;
  const legsRaw = Array.isArray(r.legs) ? r.legs : [];
  return {
    id: Number(r.id ?? 0),
    type: r.type === 'mix' ? 'mix' : 'single',
    total_amount: Number(r.total_amount ?? 0),
    bingo_amount: r.bingo_amount == null ? null : Number(r.bingo_amount),
    draw_date: String(r.draw_date ?? ''),
    is_bingo: Boolean(r.is_bingo),
    is_settled: Boolean(r.is_settled),
    created_at: String(r.created_at ?? ''),
    legs: legsRaw.map((leg) => normalizeLeg(leg, typeof r.sport === 'string' ? r.sport : undefined)),
  };
}

export function getCachedBetSlip(id: string): BetSlip | undefined {
  return cachedSlips.find((s) => String(s.id) === id);
}

function queryString(params: BetSlipsQuery): string {
  const q = new URLSearchParams();
  if (params.draw_date) q.set('draw_date', params.draw_date);
  if (params.type) q.set('type', params.type);
  if (params.is_settled !== undefined) q.set('is_settled', String(params.is_settled));
  if (params.is_bingo !== undefined) q.set('is_bingo', String(params.is_bingo));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function fetchFootballMatches(
  token: string,
  drawDate?: string,
): Promise<FootballMatchesResponse> {
  if (!API_BASE_URL) return MOCK_MATCHES;
  const q = drawDate ? `?draw_date=${drawDate}` : '';
  const data = await apiRequest<FootballMatchesResponse>(`/football/matches${q}`, {
    token,
  });
  console.log("[football/matches]", data);
  return data;
}

const MOCK_RESULTS: FootballMatchResultsResponse = {
  matches: [
    {
      id: 1,
      match_id: 12345,
      sport: 'football',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      home_result: 2,
      away_result: 1,
      home_ht_result: 1,
      away_ht_result: 0,
      is_settle: true,
      is_ht_settle: true,
      home: { id: 10, name: 'Man U', name_en: 'Man U' },
      away: { id: 11, name: 'Chelsea', name_en: 'Chelsea' },
      league: { id: 1, name: 'PREMIER LEAGUE' },
    },
    {
      id: 2,
      match_id: 12346,
      sport: 'football',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      home_result: null,
      away_result: null,
      home_ht_result: 0,
      away_ht_result: 1,
      is_settle: false,
      is_ht_settle: true,
      home: { id: 20, name: 'Liverpool', name_en: 'Liverpool' },
      away: { id: 21, name: 'Man City', name_en: 'Man City' },
      league: { id: 1, name: 'PREMIER LEAGUE' },
    },
    {
      id: 3,
      match_id: 12347,
      sport: 'football',
      draw_date: new Date().toISOString().slice(0, 10),
      match_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      home_result: 1,
      away_result: 1,
      home_ht_result: 0,
      away_ht_result: 0,
      is_settle: true,
      is_ht_settle: true,
      home: { id: 30, name: 'Boca Juniors', name_en: 'Boca Juniors' },
      away: { id: 31, name: 'River Plate', name_en: 'River Plate' },
      league: { id: 2, name: 'ARGENTINA CUP' },
    },
  ],
};

function normalizeMatchResult(raw: unknown): FootballMatchResult {
  const m = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(m.id ?? 0),
    match_id: Number(m.match_id ?? 0),
    sport: typeof m.sport === 'string' ? m.sport : 'football',
    draw_date: String(m.draw_date ?? ''),
    match_time: String(m.match_time ?? ''),
    home_result: m.home_result == null ? null : Number(m.home_result),
    away_result: m.away_result == null ? null : Number(m.away_result),
    home_ht_result: m.home_ht_result == null ? null : Number(m.home_ht_result),
    away_ht_result: m.away_ht_result == null ? null : Number(m.away_ht_result),
    is_settle: Boolean(m.is_settle),
    is_ht_settle: Boolean(m.is_ht_settle),
    home: normalizeTeam(m.home),
    away: normalizeTeam(m.away),
    league: normalizeLeague(m.league),
  };
}

export async function fetchFootballMatchResults(
  token: string,
  drawDate?: string,
): Promise<FootballMatchResultsResponse> {
  if (!API_BASE_URL) return MOCK_RESULTS;
  const q = drawDate ? `?draw_date=${drawDate}` : '';
  const data = await apiRequest<FootballMatchResultsResponse>(
    `/football/matches/results${q}`,
    { token },
  );
  return {
    matches: (data.matches ?? []).map(normalizeMatchResult),
  };
}

export async function submitBetSlip(
  token: string,
  payload: SubmitBetSlipPayload,
): Promise<BetSlip> {
  if (!API_BASE_URL) {
    const slip: BetSlip = {
      id: Date.now(),
      type: payload.type,
      total_amount: payload.total_amount,
      bingo_amount: null,
      draw_date: new Date().toISOString().slice(0, 10),
      is_bingo: false,
      is_settled: false,
      created_at: new Date().toISOString(),
      legs: payload.matches.map((m, i) => {
        const match = MOCK_MATCHES.matches.find((x) => x.id === m.match_id);
        const home = match?.home ?? { id: 0, name: 'Home', name_en: 'Home' };
        const away = match?.away ?? { id: 0, name: 'Away', name_en: 'Away' };
        const selected =
          m.selected_team_id === home.id
            ? home
            : m.selected_team_id === away.id
              ? away
              : { id: m.selected_team_id ?? 0, name: 'Pick', name_en: 'Pick' };
        return {
          id: Date.now() + i,
          bet_amount: m.bet_amount,
          odds: m.goal_up_down || m.sone_ma || m.selection ? '' : '0',
          goal_odds: m.goal_up_down ? match?.single_goal_odds ?? '2=' : null,
          market: m.market ?? null,
          selection: m.selection ?? null,
          goal_up_down: m.goal_up_down ?? null,
          sone_ma: m.sone_ma ?? null,
          is_bingo: false,
          is_cancel: false,
          home,
          away,
          selected_team: selected,
          league: match?.league ?? { id: 0, name: 'League' },
        };
      }),
    };
    mockSlips.unshift(slip);
    cachedSlips = [slip, ...cachedSlips.filter((s) => s.id !== slip.id)];
    return slip;
  }
  const data = await apiRequest<BetSlipResponse>('/football/bet-slips', {
    method: 'POST',
    token,
    body: payload,
  });
  const slip = normalizeBetSlip(data.bet_slip);
  cachedSlips = [slip, ...cachedSlips.filter((s) => s.id !== slip.id)];
  return slip;
}

export async function fetchBetSlips(
  token: string,
  params: BetSlipsQuery = {},
): Promise<BetSlip[]> {
  if (!API_BASE_URL) {
    let list = [...mockSlips];
    if (params.type) list = list.filter((s) => s.type === params.type);
    if (params.is_settled === false) list = list.filter((s) => !s.is_settled);
    if (params.is_settled === true) list = list.filter((s) => s.is_settled);
    if (params.is_bingo === true) list = list.filter((s) => s.is_bingo);
    if (params.is_bingo === false) list = list.filter((s) => s.is_settled && !s.is_bingo);
    cachedSlips = list;
    return list;
  }
  const data = await apiRequest<BetSlipsResponse>(`/football/bet-slips${queryString(params)}`, {
    token,
  });
  const slips = data.bet_slips.map(normalizeBetSlip);
  cachedSlips = slips;
  return slips;
}
