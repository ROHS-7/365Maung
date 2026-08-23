export type LiveStreamServer = {
  name: string;
  stream_url: string;
  referer: string;
};

export type LiveMatchStatus = 'live' | 'vs' | string;

export type LiveSport = 'football' | 'basketball';

export type LiveMatch = {
  match_time: number;
  match_status: LiveMatchStatus;
  home_team_name: string;
  home_team_logo: string;
  away_team_name: string;
  away_team_logo: string;
  league_name: string;
  league_logo: string;
  sport: LiveSport;
  servers: LiveStreamServer[] | null;
};

export type LiveMatchesResponse = {
  matches: LiveMatch[];
};

export type UiLiveMatch = LiveMatch & {
  id: string;
  hasStream: boolean;
  isLive: boolean;
};
