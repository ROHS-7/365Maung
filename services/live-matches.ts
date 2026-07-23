import { LIVE_MATCHES_API_URL as LIVE_URL } from '@/constants/config';
import type { LiveMatch, LiveStreamServer, UiLiveMatch } from '@/types/live-matches';

export { LIVE_URL as LIVE_MATCHES_API_URL };

const matchCache = new Map<string, UiLiveMatch>();

export function makeLiveMatchId(match: LiveMatch): string {
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

export function toUiLiveMatch(match: LiveMatch): UiLiveMatch {
  const servers = dedupeServers(match.servers);
  const ui: UiLiveMatch = {
    ...match,
    servers: servers.length ? servers : null,
    id: makeLiveMatchId(match),
    hasStream: servers.length > 0,
    isLive: match.match_status === 'live',
  };
  matchCache.set(ui.id, ui);
  return ui;
}

export function getCachedLiveMatch(id: string): UiLiveMatch | undefined {
  return matchCache.get(id);
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

export async function fetchLiveMatches(): Promise<UiLiveMatch[]> {
  const res = await fetch(LIVE_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Failed to load live matches (${res.status})`);
  }
  const data = (await res.json()) as LiveMatch[];
  if (!Array.isArray(data)) return [];

  const mapped = data.map(toUiLiveMatch);
  mapped.sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return a.match_time - b.match_time;
  });
  return mapped;
}
