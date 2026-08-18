import type { FootballLeague, FootballTeam } from '@/types/football';

export type ToWinOdds = {
  home: number;
  away: number;
};

export type FightMatch = {
  id: number;
  match_id: number;
  sport: 'fight' | string;
  draw_date: string;
  match_time: string;
  to_win_odds: ToWinOdds;
  home_result: number | null;
  away_result: number | null;
  is_show: boolean;
  is_settle: boolean;
  home: FootballTeam;
  away: FootballTeam;
  league: FootballLeague;
};

export type FightMatchesResponse = {
  matches: FightMatch[];
};

export type FightMatchResult = {
  id: number;
  match_id: number;
  sport: 'fight' | string;
  match_time?: string;
  home_result: number;
  away_result: number;
  is_settle: boolean;
  home: FootballTeam;
  away: FootballTeam;
  league: FootballLeague;
};

export type FightMatchResultsResponse = {
  matches: FightMatchResult[];
};
