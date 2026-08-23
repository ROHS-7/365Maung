import type { FootballTeam } from '@/types/football';
import type { ImageSourcePropType } from 'react-native';

export const DEFAULT_TEAM_LOGO: ImageSourcePropType = require('@/assets/icons/team-default.png');

const AVATAR_COLORS = [
  '#2563EB',
  '#DC2626',
  '#D97706',
  '#7C3AED',
  '#059669',
  '#DB2777',
  '#0891B2',
  '#EA580C',
];

export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function teamInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function logoFromTeamObject(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const t = raw as Record<string, unknown>;
  return pickString(
    t.image_url,
    t.imageUrl,
    t.logo,
    t.logo_url,
    t.logoUrl,
    t.image,
    t.team_logo,
  );
}

export function teamLogoFromMatch(
  raw: Record<string, unknown>,
  side: 'home' | 'away',
  teamLogo?: string,
): string | undefined {
  const fromTeam =
    side === 'home'
      ? pickString(
          teamLogo,
          logoFromTeamObject(raw.home),
          logoFromTeamObject(raw.home_team),
          logoFromTeamObject(raw.team_a),
        )
      : pickString(
          teamLogo,
          logoFromTeamObject(raw.away),
          logoFromTeamObject(raw.away_team),
          logoFromTeamObject(raw.team_b),
        );
  const legacy =
    side === 'home'
      ? pickString(raw.home_team_logo, raw.home_logo, raw.team_a_url, raw.teamAUrl)
      : pickString(raw.away_team_logo, raw.away_logo, raw.team_b_url, raw.teamBUrl);
  const url = pickString(fromTeam, legacy);
  return url || undefined;
}

export function applyMatchTeamLogos(
  raw: Record<string, unknown>,
  home: FootballTeam,
  away: FootballTeam,
): { home: FootballTeam; away: FootballTeam } {
  const homeLogo = teamLogoFromMatch(raw, 'home', home.logo);
  const awayLogo = teamLogoFromMatch(raw, 'away', away.logo);
  return {
    home: homeLogo ? { ...home, logo: homeLogo } : home,
    away: awayLogo ? { ...away, logo: awayLogo } : away,
  };
}

export function normalizeTeamWithLogo(raw: unknown): FootballTeam {
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
  const logo = logoFromTeamObject(raw);
  return {
    id: typeof t.id === 'number' ? t.id : 0,
    name: typeof t.name === 'string' ? t.name : '',
    name_en: nameEn,
    ...(logo ? { logo } : {}),
  };
}

export function teamLogoUrl(
  team: Pick<FootballTeam, 'logo' | 'name_en' | 'name'>,
): string | undefined {
  return team.logo || undefined;
}

export function teamBadgeName(
  team: Pick<FootballTeam, 'name_en' | 'name'>,
): string {
  return team.name_en.trim() || team.name;
}
