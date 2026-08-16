import { API_BASE_URL } from '@/constants/config';
import { apiRequest } from '@/lib/api-client';
import type {
  LiveMatch,
  LiveMatchesResponse,
  LiveStreamServer,
  UiLiveMatch,
} from '@/types/live-matches';

const matchCache = new Map<string, UiLiveMatch>();

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function toUnixSeconds(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? Math.floor(value / 1000) : value;
  }
  if (typeof value === 'string' && value.trim()) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      return asNumber > 1e12 ? Math.floor(asNumber / 1000) : asNumber;
    }
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return Math.floor(parsed / 1000);
  }
  return 0;
}

function normalizeServers(raw: unknown): LiveStreamServer[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const servers: LiveStreamServer[] = [];
  for (const item of raw) {
    const s = asRecord(item);
    const streamUrl = pickString(s.stream_url, s.url, s.link);
    if (!streamUrl) continue;
    servers.push({
      name: pickString(s.name, s.title) || 'Server',
      stream_url: streamUrl,
      referer: pickString(s.referer, s.referrer),
    });
  }
  return servers.length ? servers : null;
}

function normalizeLiveMatch(raw: unknown): LiveMatch {
  const m = asRecord(raw);
  const home = asRecord(m.home ?? m.home_team);
  const away = asRecord(m.away ?? m.away_team);
  const league = asRecord(m.league);
  const isLive = m.is_live === true || m.match_status === 'live' || m.status === 'live';

  return {
    match_time: toUnixSeconds(m.match_time),
    match_status: isLive ? 'live' : pickString(m.match_status, m.status) || 'vs',
    home_team_name: pickString(m.home_team_name, home.name, home.name_en),
    home_team_logo: pickString(m.home_team_logo, home.logo, home.logo_url, home.image),
    away_team_name: pickString(m.away_team_name, away.name, away.name_en),
    away_team_logo: pickString(m.away_team_logo, away.logo, away.logo_url, away.image),
    league_name: pickString(m.league_name, league.name, league.name_en),
    league_logo: pickString(m.league_logo, league.logo, league.logo_url, league.image),
    servers: normalizeServers(m.servers ?? m.streams ?? m.live_streams),
  };
}

export function makeLiveMatchId(match: LiveMatch, sourceId?: unknown): string {
  if (sourceId != null && String(sourceId).trim()) return String(sourceId);
  return `${match.match_time}-${match.home_team_name}-${match.away_team_name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function dedupeServers(servers: LiveStreamServer[] | null): LiveStreamServer[] {
  if (!servers?.length) return [];
  const seen = new Set<string>();
  const out: LiveStreamServer[] = [];
  for (const s of servers) {
    if (!s.stream_url || seen.has(s.stream_url)) continue;
    seen.add(s.stream_url);
    out.push(s);
  }
  return out;
}

export function toUiLiveMatch(raw: unknown): UiLiveMatch {
  const source = asRecord(raw);
  const match = normalizeLiveMatch(raw);
  const servers = dedupeServers(match.servers);
  const ui: UiLiveMatch = {
    ...match,
    servers: servers.length ? servers : null,
    id: makeLiveMatchId(match, source.id ?? source.match_id),
    hasStream: servers.length > 0,
    isLive: match.match_status === 'live',
  };
  matchCache.set(ui.id, ui);
  return ui;
}

export function getCachedLiveMatch(id: string): UiLiveMatch | undefined {
  return matchCache.get(id);
}

function streamWeight(name: string): number {
  const n = name.toLowerCase();
  if (/4k|uhd|2160/.test(n)) return 4;
  if (/fhd|1080/.test(n)) return 3;
  if (/\bhd\b|720/.test(n)) return 2;
  if (/sd|480|360|low/.test(n)) return 0;
  return 1;
}

/** Lowest labeled quality first so playback starts with less decode/buffer work. */
export function preferPlayableServer(servers: LiveStreamServer[]): LiveStreamServer {
  let best = servers[0];
  let bestWeight = streamWeight(best.name);
  for (let i = 1; i < servers.length; i++) {
    const w = streamWeight(servers[i].name);
    if (w < bestWeight) {
      best = servers[i];
      bestWeight = w;
    }
  }
  return best;
}

export function preferHdServer(servers: LiveStreamServer[]): LiveStreamServer {
  return servers.find((s) => /hd/i.test(s.name)) ?? servers[0];
}

export function formatLiveMatchTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  if (Number.isNaN(d.getTime())) return '—';
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${md} ${hours}:${minutes} ${ampm}`;
}

export async function fetchLiveMatches(token: string): Promise<UiLiveMatch[]> {
  if (!API_BASE_URL) return [];
  const data = await apiRequest<LiveMatchesResponse | LiveMatch[]>(
    '/football/live-matches',
    { token },
  );
  const list = Array.isArray(data) ? data : (data.matches ?? []);
  const mapped = list.map(toUiLiveMatch);
  mapped.sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return a.match_time - b.match_time;
  });
  return mapped;
}
