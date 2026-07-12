/** Myanmar body HDP: integer lines pay quoted odds at exact margin, +100% profit at full cover. */

export type HdpTier = 'quoted' | 'full';

/** Profit from quoted odds (+40 → 40% of stake, -18 → stake×100/18). */
export function calcHdpQuotedProfit(stake: number, odds: number): number {
  const profit =
    odds >= 0
      ? (stake * odds) / 100
      : (stake * 100) / Math.abs(odds);
  return Math.round(profit);
}

/** Full-cover tier: +100% profit on stake. */
export function calcHdpFullWinProfit(stake: number): number {
  return stake;
}

export function calcHdpQuotedReturn(stake: number, odds: number): number {
  return stake + calcHdpQuotedProfit(stake, odds);
}

export function calcHdpFullReturn(stake: number): number {
  return stake + calcHdpFullWinProfit(stake);
}

/** Positive integer handicap only (e.g. "1", "2"). Half/quarter lines use single payout. */
export function parseIntegerHandicapLine(line: string): number | null {
  const trimmed = line.trim();
  if (trimmed.includes('/')) return null;
  const n = parseFloat(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function hdpUsesMarginTiers(line: string): boolean {
  return parseIntegerHandicapLine(line) !== null;
}

export type HdpSettlement = {
  status: 'win' | 'loss';
  tier?: HdpTier;
  profit: number;
  giverMargin: number;
};

/**
 * Integer-line HDP settlement (e.g. Man U 1 (+40)).
 * Giver: win by exactly L → quoted profit; win by L+1+ → +100% profit; else loss.
 * Receiver: mirror — full win if giver margin < L, quoted if == L, loss if >= L+1.
 */
export function settleHdpIntegerLine(
  homeScore: number,
  awayScore: number,
  line: number,
  pickSide: 'home' | 'away',
  giverSide: 'home' | 'away',
  odds: number,
  stake: number,
): HdpSettlement {
  const giverMargin =
    giverSide === 'home' ? homeScore - awayScore : awayScore - homeScore;
  const backsGiver = pickSide === giverSide;

  if (backsGiver) {
    if (giverMargin >= line + 1) {
      return {
        status: 'win',
        tier: 'full',
        profit: calcHdpFullWinProfit(stake),
        giverMargin,
      };
    }
    if (giverMargin === line) {
      return {
        status: 'win',
        tier: 'quoted',
        profit: calcHdpQuotedProfit(stake, odds),
        giverMargin,
      };
    }
    return { status: 'loss', profit: 0, giverMargin };
  }

  if (giverMargin >= line + 1) {
    return { status: 'loss', profit: 0, giverMargin };
  }
  if (giverMargin === line) {
    return {
      status: 'win',
      tier: 'quoted',
      profit: calcHdpQuotedProfit(stake, odds),
      giverMargin,
    };
  }
  return {
    status: 'win',
    tier: 'full',
    profit: calcHdpFullWinProfit(stake),
    giverMargin,
  };
}

export function pickSideFromName(
  pick: string,
  home: string,
  away: string,
): 'home' | 'away' | null {
  if (pick === home) return 'home';
  if (pick === away) return 'away';
  return null;
}

export function giverSideFromPick(
  pick: string,
  home: string,
  away: string,
  hdpGiving?: 'home' | 'away',
): 'home' | 'away' | null {
  if (hdpGiving) return hdpGiving;
  const side = pickSideFromName(pick, home, away);
  return side;
}

/** Pending HDP display: min return (quoted) and max return (+100%). */
export function hdpPendingReturns(stake: number, odds: number, line: string) {
  if (!hdpUsesMarginTiers(line)) {
    const ret = calcHdpQuotedReturn(stake, odds);
    return { minReturn: ret, maxReturn: ret, usesTiers: false as const };
  }
  return {
    minReturn: calcHdpQuotedReturn(stake, odds),
    maxReturn: calcHdpFullReturn(stake),
    usesTiers: true as const,
    lineInt: parseIntegerHandicapLine(line)!,
  };
}

export function formatHdpTierLabel(
  tier: HdpTier,
  line: string,
  odds: number,
  tr: {
    betHdpTierQuoted: string;
    betHdpTierFull: string;
  },
): string {
  const lineInt = parseIntegerHandicapLine(line);
  if (tier === 'full' && lineInt != null) {
    return tr.betHdpTierFull.replace('{n}', String(lineInt + 1));
  }
  const pct = odds >= 0 ? String(odds) : `100/${Math.abs(odds)}`;
  if (lineInt != null) {
    return tr.betHdpTierQuoted.replace('{n}', String(lineInt)).replace('{pct}', pct);
  }
  return tier === 'full' ? tr.betHdpTierFull.replace('{n}', '?') : pct;
}
