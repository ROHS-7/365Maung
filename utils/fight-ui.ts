import type { Lang } from '@/constants/i18n';
import type { FightMatch } from '@/types/fight';
import {
  teamDisplayName,
  type UiLeagueData,
  type UiMatchData,
} from '@/utils/football-ui';

function formatMatchDate(matchTime: string, drawDate: string): string {
  const d = new Date(matchTime);
  if (Number.isNaN(d.getTime())) return drawDate;
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${md} ${hours}:${minutes} ${ampm}`;
}

export function mapFightMatchToUi(match: FightMatch, lang: Lang): UiMatchData {
  const d = new Date(match.match_time);
  const matchTimeMs = Number.isNaN(d.getTime()) ? Number.POSITIVE_INFINITY : d.getTime();
  return {
    id: String(match.id),
    matchDbId: match.id,
    homeId: match.home.id,
    awayId: match.away.id,
    home: teamDisplayName(match.home, lang),
    away: teamDisplayName(match.away, lang),
    homeLogo: match.home.logo,
    awayLogo: match.away.logo,
    date: formatMatchDate(match.match_time, match.draw_date),
    matchTimeMs,
    hdpGiving: 'home',
    hdpLine: '—',
    hdpOdds: 0,
    ouLine: '—',
    ouOdds: 0,
    soneOdds: null,
    maOdds: null,
    oneXTwo: null,
    toWin: {
      home: match.to_win_odds.home,
      away: match.to_win_odds.away,
    },
    correctScores: [],
    isMajor: false,
  };
}

export function groupFightMatchesByLeague(
  matches: FightMatch[],
  lang: Lang,
): UiLeagueData[] {
  const map = new Map<string, UiMatchData[]>();
  for (const m of matches) {
    if (!m.is_show || m.is_settle) continue;
    const homeOk = Number.isFinite(m.to_win_odds?.home);
    const awayOk = Number.isFinite(m.to_win_odds?.away);
    if (!homeOk || !awayOk) continue;
    const leagueName = m.league.name || 'Fight';
    const ui = mapFightMatchToUi(m, lang);
    const arr = map.get(leagueName) ?? [];
    arr.push(ui);
    map.set(leagueName, arr);
  }
  return Array.from(map.entries())
    .map(([name, leagueMatches]) => ({ name, matches: leagueMatches }))
    .filter((league) => league.matches.length > 0);
}
