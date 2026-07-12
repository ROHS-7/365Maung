import type { Lang } from '@/constants/i18n';
import type { Translations } from '@/constants/i18n';
import type { Bet, BetStatus, HdpOuBet, ParlayBet } from '@/constants/bets';
import type {
  BetSlip,
  BetSlipLeg,
  BetSlipLegPayload,
  FootballMatch,
  SubmitBetSlipPayload,
} from '@/types/football';

export type BetRow = 'hdp' | 'ou' | 'oe';
export type BetSide = 'left' | 'right';
export type SelectKey = `${string}:${BetRow}`;

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
  oeRef: string;
};

export type UiLeagueData = { name: string; matches: UiMatchData[] };

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
    oeRef: goalRaw || '—',
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
    matches: leagueMatches,
  }));
}

export function buildMatchMap(leagues: UiLeagueData[]): Map<string, UiMatchData> {
  return new Map(leagues.flatMap((l) => l.matches.map((m) => [m.id, m] as const)));
}

export function formatOddsDisplay(n: number, fallbackLine?: string): string {
  if (fallbackLine && !n) return fallbackLine;
  return n > 0 ? `+${n}` : `${n}`;
}

export function pickLabel(
  match: UiMatchData,
  row: BetRow,
  side: BetSide,
  tr: Translations,
): string {
  const giving = match.hdpGiving === 'home' ? match.home : match.away;
  const receiving = match.hdpGiving === 'home' ? match.away : match.home;
  if (row === 'hdp') {
    const team = side === 'left' ? giving : receiving;
    return `${team} ${match.hdpLine}`;
  }
  if (row === 'ou') {
    const team = side === 'left' ? match.home : match.away;
    const pick = side === 'left' ? tr.maungOver : tr.maungUnder;
    return `${team} · ${pick} ${match.ouLine}`;
  }
  const team = side === 'left' ? match.home : match.away;
  const pick = side === 'left' ? tr.maungOdd : tr.maungEven;
  return `${team} · ${pick}`;
}

export function buildBetLeg(
  match: UiMatchData,
  row: BetRow,
  side: BetSide,
  betAmount: number,
): BetSlipLegPayload {
  if (row === 'hdp') {
    const givingId = match.hdpGiving === 'home' ? match.homeId : match.awayId;
    const receivingId = match.hdpGiving === 'home' ? match.awayId : match.homeId;
    return {
      match_id: match.matchDbId,
      selected_team_id: side === 'left' ? givingId : receivingId,
      bet_amount: betAmount,
    };
  }
  if (row === 'ou') {
    return {
      match_id: match.matchDbId,
      selected_team_id: side === 'left' ? match.homeId : match.awayId,
      bet_amount: betAmount,
      goal_up_down: side === 'left' ? 'up' : 'down',
    };
  }
  return {
    match_id: match.matchDbId,
    selected_team_id: side === 'left' ? match.homeId : match.awayId,
    bet_amount: betAmount,
    sone_ma: side === 'left' ? 'sone' : 'ma',
  };
}

export function buildSubmitPayload(
  type: 'single' | 'mix',
  selections: Record<SelectKey, BetSide>,
  matchMap: Map<string, UiMatchData>,
  totalAmount: number,
): SubmitBetSlipPayload {
  const legs = Object.entries(selections).map(([key, side]) => {
    const [matchId, row] = key.split(':') as [string, BetRow];
    const match = matchMap.get(matchId);
    if (!match) throw new Error('Match not found');
    return buildBetLeg(match, row, side, totalAmount);
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
  return {
    home: home || '—',
    away: away || '—',
  };
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
  const goalLine = (leg.goal_odds ?? '').replace('=', '').trim();
  const isGoalBet = Boolean(leg.goal_odds || leg.goal_up_down);

  if (isGoalBet) {
    const sideTeam =
      leg.goal_up_down === 'up'
        ? leg.home
        : leg.goal_up_down === 'down'
          ? leg.away
          : leg.selected_team;
    const team =
      readTeamName(leg.selected_team, lang) ||
      readTeamName(sideTeam, lang) ||
      teamNameById(leg, readTeamId(leg.selected_team), lang);
    const pick =
      leg.goal_up_down === 'up'
        ? tr.maungOver
        : leg.goal_up_down === 'down'
          ? tr.maungUnder
          : null;
    if (team && pick && goalLine) return `${team} · ${pick} ${goalLine}`;
    if (team && pick) return `${team} · ${pick}`;
    if (pick && goalLine) return `${pick} ${goalLine}`;
    if (goalLine) return `${tr.maungOver}/${tr.maungUnder} ${goalLine}`;
    return `${tr.maungOver}/${tr.maungUnder}`;
  }

  if (leg.sone_ma) {
    const sideTeam = leg.sone_ma === 'sone' ? leg.home : leg.away;
    const team =
      readTeamName(leg.selected_team, lang) ||
      readTeamName(sideTeam, lang) ||
      teamNameById(leg, readTeamId(leg.selected_team), lang);
    const pick = leg.sone_ma === 'sone' ? tr.maungOdd : tr.maungEven;
    return team ? `${team} · ${pick}` : pick;
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
  if (leg.goal_odds || leg.goal_up_down) return 'O/U';
  if (leg.sone_ma) return 'O/E';
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
    line: leg?.odds?.trim() || leg?.goal_odds || '—',
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
