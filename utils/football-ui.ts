import type { Lang } from '@/constants/i18n';
import type { Translations } from '@/constants/i18n';
import type { Bet, BetStatus, HdpOuBet, ParlayBet } from '@/constants/bets';
import type {
  BetSlip,
  BetSlipLeg,
  BetSlipLegPayload,
  FootballMarket,
  FootballMatch,
  SubmitBetSlipPayload,
} from '@/types/football';

export type BetPick = string;
/** `${matchId}:${market}:${pick}` */
export type SelectKey = `${string}:${FootballMarket}:${string}`;

export type UiMatchData = {
  id: string;
  matchDbId: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  date: string;
  hdpGiving: 'home' | 'away';
  hdpLine: string;
  hdpOdds: number;
  ouLine: string;
  ouOdds: number;
  soneOdds: number | null;
  maOdds: number | null;
  oneXTwo: { home: number; draw: number; away: number } | null;
  correctScores: { key: string; odds: number }[];
  isMajor: boolean;
};

export type UiLeagueData = { name: string; matches: UiMatchData[] };

export const ALL_MARKETS: FootballMarket[] = [
  'asian_handicap',
  'goals_ou',
  'sone_ma',
  'match_winner_1x2',
  'correct_score',
];

export function formatDrawDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function teamDisplayName(team: { name: string; name_en: string }, lang: Lang): string {
  return lang === 'en' && team.name_en?.trim() ? team.name_en : team.name;
}

function parseOddsNumber(raw: string): number {
  const m = raw.match(/-?\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

export function makeSelectKey(matchId: string, market: FootballMarket, pick: string): SelectKey {
  return `${matchId}:${market}:${pick}`;
}

export function parseSelectKey(key: string): {
  matchId: string;
  market: FootballMarket;
  pick: string;
} {
  const [matchId, market, ...rest] = key.split(':');
  return {
    matchId,
    market: market as FootballMarket,
    pick: rest.join(':'),
  };
}

export function mapFootballMatchToUi(
  match: FootballMatch,
  mode: 'single' | 'mix',
  lang: Lang,
): UiMatchData {
  const hdpRaw = mode === 'single' ? match.single_odds : match.mix_odds;
  const goalRaw = mode === 'single' ? match.single_goal_odds : match.mix_goal_odds;
  const hdpGiving = match.odds_team.id === match.home.id ? 'home' : 'away';
  const d = new Date(match.match_time);
  const dateStr = Number.isNaN(d.getTime())
    ? match.draw_date
    : `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const cs = match.correct_score_odds
    ? Object.entries(match.correct_score_odds).map(([key, odds]) => ({ key, odds }))
    : [];

  return {
    id: String(match.id),
    matchDbId: match.id,
    homeId: match.home.id,
    awayId: match.away.id,
    home: teamDisplayName(match.home, lang),
    away: teamDisplayName(match.away, lang),
    date: dateStr,
    hdpGiving,
    hdpLine: hdpRaw || '—',
    hdpOdds: parseOddsNumber(hdpRaw),
    ouLine: goalRaw?.replace('=', '') || '—',
    ouOdds: parseOddsNumber(goalRaw ?? ''),
    soneOdds: match.sone_ma_odds?.sone ?? null,
    maOdds: match.sone_ma_odds?.ma ?? null,
    oneXTwo: match.one_x_two_odds
      ? {
          home: match.one_x_two_odds.home,
          draw: match.one_x_two_odds.draw,
          away: match.one_x_two_odds.away,
        }
      : null,
    correctScores: cs,
    isMajor: Boolean(match.is_major),
  };
}

export function groupMatchesByLeague(
  matches: FootballMatch[],
  mode: 'single' | 'mix',
  lang: Lang,
): UiLeagueData[] {
  const map = new Map<string, UiMatchData[]>();
  for (const m of matches) {
    if (!m.is_show || m.is_settle) continue;
    const leagueName = m.league.name;
    const ui = mapFootballMatchToUi(m, mode, lang);
    const arr = map.get(leagueName) ?? [];
    arr.push(ui);
    map.set(leagueName, arr);
  }
  return Array.from(map.entries()).map(([name, leagueMatches]) => ({
    name,
    matches: leagueMatches.sort((a, b) => Number(b.isMajor) - Number(a.isMajor)),
  }));
}

export function buildMatchMap(leagues: UiLeagueData[]): Map<string, UiMatchData> {
  return new Map(leagues.flatMap((l) => l.matches.map((m) => [m.id, m] as const)));
}

export function formatOddsDisplay(n: number, fallbackLine?: string): string {
  if (fallbackLine && !n) return fallbackLine;
  return n > 0 ? `+${n}` : `${n}`;
}

export function formatDecimalOdds(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toFixed(2).replace(/\.?0+$/, '') === String(Math.round(n))
    ? String(n)
    : n.toFixed(2);
}

export function pickLabel(
  match: UiMatchData,
  market: FootballMarket,
  pick: string,
  tr: Translations,
): string {
  if (market === 'asian_handicap') {
    const giving = match.hdpGiving === 'home' ? match.home : match.away;
    const receiving = match.hdpGiving === 'home' ? match.away : match.home;
    const team = pick === 'giving' ? giving : receiving;
    return `${team} ${match.hdpLine}`;
  }
  if (market === 'goals_ou') {
    const label = pick === 'up' ? tr.maungOver : tr.maungUnder;
    return `${label} ${match.ouLine}`;
  }
  if (market === 'sone_ma') {
    return pick === 'sone' ? tr.maungOdd : tr.maungEven;
  }
  if (market === 'match_winner_1x2') {
    if (pick === 'home') return `${match.home} (1)`;
    if (pick === 'away') return `${match.away} (2)`;
    return `${tr.footballDraw} (X)`;
  }
  return `${tr.footballCorrectScore} ${pick}`;
}

export function buildBetLeg(
  match: UiMatchData,
  market: FootballMarket,
  pick: string,
  betAmount: number,
): BetSlipLegPayload {
  if (market === 'asian_handicap') {
    const givingId = match.hdpGiving === 'home' ? match.homeId : match.awayId;
    const receivingId = match.hdpGiving === 'home' ? match.awayId : match.homeId;
    return {
      match_id: match.matchDbId,
      market,
      selected_team_id: pick === 'giving' ? givingId : receivingId,
      bet_amount: betAmount,
    };
  }
  if (market === 'goals_ou') {
    return {
      match_id: match.matchDbId,
      market,
      selected_team_id: pick === 'up' ? match.homeId : match.awayId,
      bet_amount: betAmount,
      goal_up_down: pick === 'up' ? 'up' : 'down',
    };
  }
  if (market === 'sone_ma') {
    return {
      match_id: match.matchDbId,
      market,
      selected_team_id: pick === 'sone' ? match.homeId : match.awayId,
      bet_amount: betAmount,
      sone_ma: pick === 'sone' ? 'sone' : 'ma',
    };
  }
  if (market === 'match_winner_1x2') {
    return {
      match_id: match.matchDbId,
      market,
      selection: pick,
      bet_amount: betAmount,
      selected_team_id:
        pick === 'home' ? match.homeId : pick === 'away' ? match.awayId : match.homeId,
    };
  }
  return {
    match_id: match.matchDbId,
    market: 'correct_score',
    selection: pick,
    bet_amount: betAmount,
    selected_team_id: match.homeId,
  };
}

export function buildSubmitPayload(
  type: 'single' | 'mix',
  selections: Record<string, true>,
  matchMap: Map<string, UiMatchData>,
  totalAmount: number,
): SubmitBetSlipPayload {
  const keys = Object.keys(selections);
  const legs = keys.map((key) => {
    const { matchId, market, pick } = parseSelectKey(key);
    const match = matchMap.get(matchId);
    if (!match) throw new Error('Match not found');
    return buildBetLeg(match, market, pick, totalAmount);
  });

  return { type, total_amount: totalAmount, matches: legs };
}

function slipStatus(slip: BetSlip): BetStatus {
  if (!slip.is_settled) return 'pending';
  return slip.is_bingo ? 'win' : 'loss';
}

function formatSlipTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function readTeamName(team: unknown, lang: Lang): string {
  if (!team || typeof team !== 'object') return '';
  const t = team as Record<string, unknown>;
  const nameEn = [t.name_en, t.nameEn].find((v) => typeof v === 'string') as string | undefined;
  const name = typeof t.name === 'string' ? t.name : undefined;
  if (lang === 'en' && nameEn?.trim()) return nameEn.trim();
  if (name?.trim()) return name.trim();
  if (nameEn?.trim()) return nameEn.trim();
  return '';
}

function readTeamId(team: unknown): number | undefined {
  if (!team || typeof team !== 'object') return undefined;
  const id = (team as Record<string, unknown>).id;
  return typeof id === 'number' ? id : undefined;
}

function resolveLegTeams(leg: BetSlipLeg, lang: Lang): { home: string; away: string } {
  let home = readTeamName(leg.home, lang);
  let away = readTeamName(leg.away, lang);
  if (!home) home = readTeamName(leg.match?.home, lang);
  if (!away) away = readTeamName(leg.match?.away, lang);
  return { home: home || '—', away: away || '—' };
}

function teamNameById(leg: BetSlipLeg, teamId: number | undefined, lang: Lang): string {
  if (teamId == null) return '';
  const candidates = [leg.selected_team, leg.home, leg.away, leg.match?.home, leg.match?.away];
  for (const team of candidates) {
    if (readTeamId(team) === teamId) {
      const name = readTeamName(team, lang);
      if (name) return name;
    }
  }
  return '';
}

function legPickLabel(leg: BetSlipLeg, tr: Translations, lang: Lang): string {
  if (leg.market === 'match_winner_1x2' && leg.selection) {
    const teams = resolveLegTeams(leg, lang);
    if (leg.selection === 'home') return `${teams.home} (1)`;
    if (leg.selection === 'away') return `${teams.away} (2)`;
    if (leg.selection === 'draw') return `${tr.footballDraw} (X)`;
    return leg.selection;
  }

  if (leg.market === 'correct_score' && leg.selection) {
    return `${tr.footballCorrectScore} ${leg.selection}`;
  }

  if (leg.selection && (leg.selection.includes('-') || leg.selection.toUpperCase() === 'AOS')) {
    return `${tr.footballCorrectScore} ${leg.selection}`;
  }

  const goalLine = (leg.goal_odds ?? '').replace('=', '').trim();
  if (leg.goal_odds || leg.goal_up_down || leg.market === 'goals_ou') {
    const pick =
      leg.goal_up_down === 'up'
        ? tr.maungOver
        : leg.goal_up_down === 'down'
          ? tr.maungUnder
          : null;
    if (pick && goalLine) return `${pick} ${goalLine}`;
    if (pick) return pick;
    if (goalLine) return `${tr.maungOver}/${tr.maungUnder} ${goalLine}`;
    return `${tr.maungOver}/${tr.maungUnder}`;
  }

  if (leg.sone_ma || leg.market === 'sone_ma') {
    return leg.sone_ma === 'ma' ? tr.maungEven : tr.maungOdd;
  }

  const team =
    readTeamName(leg.selected_team, lang) ||
    teamNameById(leg, readTeamId(leg.selected_team), lang);
  const line = leg.odds?.trim();
  if (team && line) return `${team} ${line}`;
  return team || line || '—';
}

function legOddsValue(leg: BetSlipLeg): number {
  if (leg.goal_odds) return parseOddsNumber(leg.goal_odds);
  return parseOddsNumber(leg.odds ?? '');
}

function parseOddsMultiplier(raw: string): number {
  const n = parseOddsNumber(raw);
  if (!n) return 1;
  if (n > 0) return 1 + n / 100;
  return 1 + 100 / Math.abs(n);
}

function inferBetType(leg: BetSlipLeg): HdpOuBet['betType'] {
  if (leg.market === 'match_winner_1x2') return '1X2';
  if (leg.market === 'correct_score') return 'CS';
  if (leg.goal_odds || leg.goal_up_down || leg.market === 'goals_ou') return 'O/U';
  if (leg.sone_ma || leg.market === 'sone_ma') return 'O/E';
  return 'HDP';
}

export function mapBetSlipToBet(slip: BetSlip, tr: Translations, lang: Lang = 'my'): Bet {
  const status = slipStatus(slip);

  if (slip.type === 'mix') {
    const totalOdds =
      slip.legs.reduce(
        (acc, leg) => acc * parseOddsMultiplier(leg.odds || leg.goal_odds || '0'),
        1,
      ) || slip.legs.length;
    const parlay: ParlayBet = {
      kind: 'parlay',
      id: String(slip.id),
      time: formatSlipTime(slip.created_at),
      picks: slip.legs.map((leg) => {
        const teams = resolveLegTeams(leg, lang);
        return {
          home: teams.home,
          away: teams.away,
          pick: legPickLabel(leg, tr, lang),
        };
      }),
      totalOdds: Math.round(totalOdds * 100) / 100,
      stake: slip.total_amount,
      payout: slip.bingo_amount ?? 0,
      status,
    };
    return parlay;
  }

  const leg = slip.legs[0];
  const betType = leg ? inferBetType(leg) : 'HDP';
  const teams = leg ? resolveLegTeams(leg, lang) : { home: '—', away: '—' };
  const hdp: HdpOuBet = {
    kind: 'hdpou',
    id: String(slip.id),
    time: formatSlipTime(slip.created_at),
    home: teams.home,
    away: teams.away,
    betType,
    pick: leg ? legPickLabel(leg, tr, lang) : '—',
    line: leg?.odds?.trim() || leg?.goal_odds || leg?.selection || '—',
    odds: leg ? legOddsValue(leg) : 0,
    stake: slip.total_amount,
    payout: slip.bingo_amount ?? 0,
    status,
    hdpGiving:
      leg && readTeamId(leg.selected_team) === readTeamId(leg.home) ? 'home' : 'away',
  };
  return hdp;
}

export function mapBetSlipsToBets(slips: BetSlip[], tr: Translations, lang: Lang = 'my'): Bet[] {
  return slips.map((s) => mapBetSlipToBet(s, tr, lang));
}
