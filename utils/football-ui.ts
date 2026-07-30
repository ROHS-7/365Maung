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
  toWin: { home: number; away: number } | null;
  correctScores: { key: string; odds: number }[];
  isMajor: boolean;
};

export type OddsPeriod = 'ft' | 'fh';

export function isAsianHandicapMarket(
  market: FootballMarket,
): market is 'asian_handicap' | 'asian_handicap_fh' {
  return market === 'asian_handicap' || market === 'asian_handicap_fh';
}

export function isGoalsOuMarket(
  market: FootballMarket,
): market is 'goals_ou' | 'goals_ou_fh' {
  return market === 'goals_ou' || market === 'goals_ou_fh';
}

export function hdpMarketFromList(
  markets: FootballMarket[],
): 'asian_handicap' | 'asian_handicap_fh' | null {
  if (markets.includes('asian_handicap_fh')) return 'asian_handicap_fh';
  if (markets.includes('asian_handicap')) return 'asian_handicap';
  return null;
}

export function ouMarketFromList(
  markets: FootballMarket[],
): 'goals_ou' | 'goals_ou_fh' | null {
  if (markets.includes('goals_ou_fh')) return 'goals_ou_fh';
  if (markets.includes('goals_ou')) return 'goals_ou';
  return null;
}

export function oddsPeriodFromMarkets(markets?: FootballMarket[]): OddsPeriod {
  if (!markets?.length) return 'ft';
  return markets.some((m) => m === 'asian_handicap_fh' || m === 'goals_ou_fh')
    ? 'fh'
    : 'ft';
}

export type UiLeagueData = { name: string; matches: UiMatchData[] };

export const ALL_MARKETS: FootballMarket[] = [
  'asian_handicap',
  'goals_ou',
  'asian_handicap_fh',
  'goals_ou_fh',
  'sone_ma',
  'match_winner_1x2',
  'correct_score',
  'to_win',
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

/** Reject empty / placeholder odds like "-", "*", "—" */
export function isValidOddsValue(raw: unknown): boolean {
  if (raw == null) return false;
  if (typeof raw === 'number') return Number.isFinite(raw);
  const s = String(raw).trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (
    lower === '-' ||
    lower === '*' ||
    lower === '—' ||
    lower === '–' ||
    lower === '?' ||
    lower === '#' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'none'
  ) {
    return false;
  }
  // Must contain a digit or letter (e.g. "0", "0/0.5", "AOS")
  return /[0-9a-z]/i.test(s);
}

export function matchHasValidMarket(
  match: FootballMatch,
  mode: 'single' | 'mix',
  market: FootballMarket,
): boolean {
  switch (market) {
    case 'asian_handicap': {
      const raw = mode === 'single' ? match.single_odds : match.mix_odds;
      return isValidOddsValue(raw);
    }
    case 'goals_ou': {
      const raw = mode === 'single' ? match.single_goal_odds : match.mix_goal_odds;
      return isValidOddsValue(raw);
    }
    case 'asian_handicap_fh': {
      const raw = mode === 'single' ? match.single_fh_odds : match.mix_fh_odds;
      return isValidOddsValue(raw);
    }
    case 'goals_ou_fh': {
      const raw = mode === 'single' ? match.single_fh_goal_odds : match.mix_fh_goal_odds;
      return isValidOddsValue(raw);
    }
    case 'sone_ma':
      return (
        match.sone_ma_odds != null &&
        Number.isFinite(match.sone_ma_odds.sone) &&
        Number.isFinite(match.sone_ma_odds.ma)
      );
    case 'match_winner_1x2':
      return (
        match.one_x_two_odds != null &&
        Number.isFinite(match.one_x_two_odds.home) &&
        Number.isFinite(match.one_x_two_odds.draw) &&
        Number.isFinite(match.one_x_two_odds.away)
      );
    case 'correct_score':
      return Boolean(
        match.correct_score_odds &&
          Object.values(match.correct_score_odds).some((n) => Number.isFinite(n)),
      );
    default:
      return false;
  }
}

export function uiMatchHasValidMarket(match: UiMatchData, market: FootballMarket): boolean {
  switch (market) {
    case 'asian_handicap':
    case 'asian_handicap_fh':
      return isValidOddsValue(match.hdpLine);
    case 'goals_ou':
    case 'goals_ou_fh':
      return isValidOddsValue(match.ouLine);
    case 'sone_ma':
      return Number.isFinite(match.soneOdds) && Number.isFinite(match.maOdds);
    case 'match_winner_1x2':
      return (
        match.oneXTwo != null &&
        Number.isFinite(match.oneXTwo.home) &&
        Number.isFinite(match.oneXTwo.draw) &&
        Number.isFinite(match.oneXTwo.away)
      );
    case 'correct_score':
      return match.correctScores.some((c) => Number.isFinite(c.odds));
    case 'to_win':
      return (
        match.toWin != null &&
        Number.isFinite(match.toWin.home) &&
        Number.isFinite(match.toWin.away)
      );
    default:
      return false;
  }
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
  period: OddsPeriod = 'ft',
): UiMatchData {
  const hdpRaw =
    period === 'fh'
      ? mode === 'single'
        ? match.single_fh_odds
        : match.mix_fh_odds
      : mode === 'single'
        ? match.single_odds
        : match.mix_odds;
  const goalRaw =
    period === 'fh'
      ? mode === 'single'
        ? match.single_fh_goal_odds
        : match.mix_fh_goal_odds
      : mode === 'single'
        ? match.single_goal_odds
        : match.mix_goal_odds;
  const oddsTeam =
    period === 'fh' && match.fh_odds_team ? match.fh_odds_team : match.odds_team;
  const hdpGiving = oddsTeam.id === match.home.id ? 'home' : 'away';
  const d = new Date(match.match_time);
  let dateStr = match.draw_date;
  if (!Number.isNaN(d.getTime())) {
    const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    dateStr = `${md} ${hours}:${minutes} ${ampm}`;
  }

  const cs = match.correct_score_odds
    ? Object.entries(match.correct_score_odds).map(([key, odds]) => ({ key, odds }))
    : [];

  const hdpStr = hdpRaw ?? '';
  const goalStr = goalRaw ?? '';

  return {
    id: String(match.id),
    matchDbId: match.id,
    homeId: match.home.id,
    awayId: match.away.id,
    home: teamDisplayName(match.home, lang),
    away: teamDisplayName(match.away, lang),
    date: dateStr,
    hdpGiving,
    hdpLine: isValidOddsValue(hdpStr) ? hdpStr : '—',
    hdpOdds: parseOddsNumber(hdpStr),
    ouLine: isValidOddsValue(goalStr) ? goalStr.replace('=', '') : '—',
    ouOdds: parseOddsNumber(goalStr),
    soneOdds: match.sone_ma_odds?.sone ?? null,
    maOdds: match.sone_ma_odds?.ma ?? null,
    oneXTwo: match.one_x_two_odds
      ? {
          home: match.one_x_two_odds.home,
          draw: match.one_x_two_odds.draw,
          away: match.one_x_two_odds.away,
        }
      : null,
    toWin: null,
    correctScores: cs,
    isMajor: Boolean(match.is_major),
  };
}

export function groupMatchesByLeague(
  matches: FootballMatch[],
  mode: 'single' | 'mix',
  lang: Lang,
  markets?: FootballMarket[],
): UiLeagueData[] {
  const period = oddsPeriodFromMarkets(markets);
  const map = new Map<string, UiMatchData[]>();
  for (const m of matches) {
    if (!m.is_show) continue;
    if (period === 'fh' ? m.is_ht_settle : m.is_settle) continue;
    if (
      markets?.length &&
      !markets.some((market) => matchHasValidMarket(m, mode, market))
    ) {
      continue;
    }
    const leagueName = m.league.name;
    const ui = mapFootballMatchToUi(m, mode, lang, period);
    const arr = map.get(leagueName) ?? [];
    arr.push(ui);
    map.set(leagueName, arr);
  }
  return Array.from(map.entries())
    .map(([name, leagueMatches]) => ({
      name,
      matches: leagueMatches.sort((a, b) => Number(b.isMajor) - Number(a.isMajor)),
    }))
    .filter((league) => league.matches.length > 0);
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
  const fh = market === 'asian_handicap_fh' || market === 'goals_ou_fh' ? '1H ' : '';
  if (isAsianHandicapMarket(market)) {
    const giving = match.hdpGiving === 'home' ? match.home : match.away;
    const receiving = match.hdpGiving === 'home' ? match.away : match.home;
    const team = pick === 'giving' ? giving : receiving;
    return `${fh}${team} ${match.hdpLine}`;
  }
  if (isGoalsOuMarket(market)) {
    const label = pick === 'up' ? tr.maungOver : tr.maungUnder;
    return `${fh}${label} ${match.ouLine}`;
  }
  if (market === 'sone_ma') {
    return pick === 'sone' ? tr.maungOdd : tr.maungEven;
  }
  if (market === 'match_winner_1x2') {
    if (pick === 'home') return `${match.home} (1)`;
    if (pick === 'away') return `${match.away} (2)`;
    return `${tr.footballDraw} (X)`;
  }
  if (market === 'to_win') {
    const odds =
      pick === 'home' ? match.toWin?.home : pick === 'away' ? match.toWin?.away : null;
    const team = pick === 'home' ? match.home : match.away;
    if (odds != null && Number.isFinite(odds)) return `${team} @ ${odds}`;
    return team;
  }
  return `${tr.footballCorrectScore} ${pick}`;
}

export function buildBetLeg(
  match: UiMatchData,
  market: FootballMarket,
  pick: string,
  betAmount: number,
): BetSlipLegPayload {
  if (isAsianHandicapMarket(market)) {
    const givingId = match.hdpGiving === 'home' ? match.homeId : match.awayId;
    const receivingId = match.hdpGiving === 'home' ? match.awayId : match.homeId;
    return {
      match_id: match.matchDbId,
      market,
      selected_team_id: pick === 'giving' ? givingId : receivingId,
      bet_amount: betAmount,
    };
  }
  if (isGoalsOuMarket(market)) {
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
  if (market === 'to_win') {
    return {
      match_id: match.matchDbId,
      market: 'to_win',
      selection: pick,
      bet_amount: betAmount,
      selected_team_id: pick === 'away' ? match.awayId : match.homeId,
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
  if ((leg.market === 'match_winner_1x2' || leg.market === 'to_win') && leg.selection) {
    const teams = resolveLegTeams(leg, lang);
    if (leg.selection === 'home') {
      if (leg.market === 'to_win' && leg.decimal_odds != null) {
        return `${teams.home} @ ${leg.decimal_odds}`;
      }
      return `${teams.home} (1)`;
    }
    if (leg.selection === 'away') {
      if (leg.market === 'to_win' && leg.decimal_odds != null) {
        return `${teams.away} @ ${leg.decimal_odds}`;
      }
      return `${teams.away} (2)`;
    }
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
  if (leg.goal_odds || leg.goal_up_down || isGoalsOuMarket(leg.market as FootballMarket)) {
    const pick =
      leg.goal_up_down === 'up'
        ? tr.maungOver
        : leg.goal_up_down === 'down'
          ? tr.maungUnder
          : null;
    const fh = leg.market === 'goals_ou_fh' ? '1H ' : '';
    if (pick && goalLine) return `${fh}${pick} ${goalLine}`;
    if (pick) return `${fh}${pick}`;
    if (goalLine) return `${fh}${tr.maungOver}/${tr.maungUnder} ${goalLine}`;
    return `${fh}${tr.maungOver}/${tr.maungUnder}`;
  }

  if (leg.sone_ma || leg.market === 'sone_ma') {
    return leg.sone_ma === 'ma' ? tr.maungEven : tr.maungOdd;
  }

  const team =
    readTeamName(leg.selected_team, lang) ||
    teamNameById(leg, readTeamId(leg.selected_team), lang);
  const line = leg.odds?.trim();
  const fh = leg.market === 'asian_handicap_fh' ? '1H ' : '';
  if (team && line) return `${fh}${team} ${line}`;
  return team || line || '—';
}

function legOddsValue(leg: BetSlipLeg): number {
  if (leg.decimal_odds != null && Number.isFinite(leg.decimal_odds)) {
    return leg.decimal_odds;
  }
  if (leg.goal_odds) return parseOddsNumber(leg.goal_odds);
  return parseOddsNumber(leg.odds ?? '');
}

function parseOddsMultiplier(raw: string): number {
  const n = parseOddsNumber(raw);
  if (!n) return 1;
  if (n > 0) return 1 + n / 100;
  return 1 + 100 / Math.abs(n);
}

function resolveSelectedSide(leg: BetSlipLeg): 'home' | 'away' | 'draw' | null {
  if (leg.selection === 'home' || leg.selection === 'away' || leg.selection === 'draw') {
    return leg.selection;
  }
  if (leg.market === 'match_winner_1x2' || leg.market === 'to_win') {
    if (leg.selection === 'home' || leg.selection === 'away' || leg.selection === 'draw') {
      return leg.selection;
    }
  }
  if (leg.goal_odds || leg.goal_up_down || leg.market === 'goals_ou' || leg.market === 'goals_ou_fh') return null;
  if (leg.sone_ma || leg.market === 'sone_ma') return null;
  if (leg.market === 'correct_score') return null;

  const selectedId = readTeamId(leg.selected_team);
  const homeId = readTeamId(leg.home) ?? readTeamId(leg.match?.home);
  const awayId = readTeamId(leg.away) ?? readTeamId(leg.match?.away);
  if (selectedId != null && homeId != null && selectedId === homeId) return 'home';
  if (selectedId != null && awayId != null && selectedId === awayId) return 'away';
  return null;
}

function inferBetType(leg: BetSlipLeg): HdpOuBet['betType'] {
  if (leg.market === 'to_win') return 'To Win';
  if (leg.market === 'match_winner_1x2') return '1X2';
  if (leg.market === 'correct_score') return 'CS';
  if (leg.market === 'goals_ou_fh') return 'O/U 1H';
  if (leg.market === 'asian_handicap_fh') return 'HDP 1H';
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
          selectedSide: resolveSelectedSide(leg),
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
  const line =
    leg?.decimal_odds != null && Number.isFinite(leg.decimal_odds)
      ? String(leg.decimal_odds)
      : leg?.odds?.trim() || leg?.goal_odds || leg?.selection || '—';
  const hdp: HdpOuBet = {
    kind: 'hdpou',
    id: String(slip.id),
    time: formatSlipTime(slip.created_at),
    home: teams.home,
    away: teams.away,
    betType,
    pick: leg ? legPickLabel(leg, tr, lang) : '—',
    line,
    odds: leg ? legOddsValue(leg) : 0,
    stake: slip.total_amount,
    payout: slip.bingo_amount ?? 0,
    status,
    selectedSide: leg ? resolveSelectedSide(leg) : null,
    hdpGiving:
      leg && readTeamId(leg.selected_team) === readTeamId(leg.home) ? 'home' : 'away',
  };
  return hdp;
}

export function mapBetSlipsToBets(slips: BetSlip[], tr: Translations, lang: Lang = 'my'): Bet[] {
  return slips.map((s) => mapBetSlipToBet(s, tr, lang));
}
