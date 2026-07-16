export type FootballTeam = {
  id: number;
  name: string;
  name_en: string;
};

export type FootballLeague = {
  id: number;
  name: string;
};

export type OneXTwoOdds = {
  home: number;
  draw: number;
  away: number;
};

export type SoneMaOdds = {
  sone: number;
  ma: number;
};

/** Keys are score strings e.g. "1-0", "2-1", "AOS" */
export type CorrectScoreOdds = Record<string, number>;

export type FootballMarket =
  | 'asian_handicap'
  | 'goals_ou'
  | 'sone_ma'
  | 'match_winner_1x2'
  | 'correct_score';

export type FootballMatch = {
  id: number;
  match_id: number;
  draw_date: string;
  match_time: string;
  single_odds: string;
  single_goal_odds: string;
  mix_odds: string;
  mix_goal_odds: string;
  one_x_two_odds?: OneXTwoOdds | null;
  correct_score_odds?: CorrectScoreOdds | null;
  sone_ma_odds?: SoneMaOdds | null;
  home_result: number | null;
  away_result: number | null;
  is_show: boolean;
  is_major: boolean;
  is_settle: boolean;
  home: FootballTeam;
  away: FootballTeam;
  odds_team: FootballTeam;
  league: FootballLeague;
};

export type FootballMatchesResponse = {
  matches: FootballMatch[];
};

export type BetSlipLegPayload = {
  match_id: number;
  bet_amount: number;
  market?: FootballMarket;
  selected_team_id?: number;
  goal_up_down?: 'up' | 'down';
  sone_ma?: 'sone' | 'ma';
  selection?: string;
};

export type SubmitBetSlipPayload = {
  type: 'single' | 'mix';
  total_amount: number;
  external_voucher_id?: string;
  matches: BetSlipLegPayload[];
};

export type BetSlipLeg = {
  id: number;
  bet_amount: number;
  odds: string;
  goal_odds: string | null;
  market?: FootballMarket | null;
  selection?: string | null;
  goal_up_down?: 'up' | 'down' | null;
  sone_ma?: 'sone' | 'ma' | null;
  is_bingo: boolean;
  is_cancel: boolean;
  home: FootballTeam;
  away: FootballTeam;
  selected_team: FootballTeam;
  league: FootballLeague;
  match?: {
    home?: FootballTeam;
    away?: FootballTeam;
  };
};

export type BetSlip = {
  id: number;
  type: 'single' | 'mix';
  total_amount: number;
  bingo_amount: number | null;
  draw_date: string;
  is_bingo: boolean;
  is_settled: boolean;
  created_at: string;
  legs: BetSlipLeg[];
};

export type BetSlipResponse = {
  message?: string;
  bet_slip: BetSlip;
};

export type BetSlipsResponse = {
  bet_slips: BetSlip[];
};

export type BetSlipsQuery = {
  draw_date?: string;
  type?: 'single' | 'mix';
  is_settled?: boolean;
  is_bingo?: boolean;
};
