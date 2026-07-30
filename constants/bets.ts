import type { HdpTier } from '@/utils/hdp-settlement';
import { calcHdpQuotedReturn } from '@/utils/hdp-settlement';

export type BetStatus = 'pending' | 'win' | 'loss';

export type SelectedSide = 'home' | 'away' | 'draw';

export type HdpOuBet = {
  kind: 'hdpou';
  id: string;
  time: string;
  home: string;
  away: string;
  betType: 'HDP' | 'O/U' | 'O/E' | '1X2' | 'CS' | 'HDP 1H' | 'O/U 1H' | 'To Win';
  pick: string;
  line: string;
  odds: number;
  stake: number;
  /** Profit amount (not total return). */
  payout: number;
  status: BetStatus;
  /** Which side the user picked, when applicable. */
  selectedSide?: SelectedSide | null;
  /** Team giving the handicap (HDP only). */
  hdpGiving?: 'home' | 'away';
  /** Final score — settled HDP with margin tiers. */
  homeScore?: number;
  awayScore?: number;
  /** Which margin tier paid out (HDP integer line). */
  hdpTier?: HdpTier;
};

export type ParlayBet = {
  kind: 'parlay';
  id: string;
  time: string;
  picks: {
    home: string;
    away: string;
    pick: string;
    selectedSide?: SelectedSide | null;
  }[];
  totalOdds: number;
  stake: number;
  payout: number;
  status: BetStatus;
};

export type Bet = HdpOuBet | ParlayBet;

const FINISHED_HDPOU: HdpOuBet[] = [
  {
    kind: 'hdpou', id: 'f1', time: '21:00', home: 'Man U', away: 'Chelsea',
    betType: 'HDP', pick: 'Man U', line: '1', odds: 40, stake: 10000,
    hdpGiving: 'home', homeScore: 1, awayScore: 0, hdpTier: 'quoted',
    payout: 4000, status: 'win',
  },
  {
    kind: 'hdpou', id: 'f1b', time: '21:00', home: 'Man U', away: 'Chelsea',
    betType: 'HDP', pick: 'Man U', line: '1', odds: 40, stake: 5000,
    hdpGiving: 'home', homeScore: 2, awayScore: 0, hdpTier: 'full',
    payout: 5000, status: 'win',
  },
  {
    kind: 'hdpou', id: 'f1c', time: '21:00', home: 'Man U', away: 'Chelsea',
    betType: 'HDP', pick: 'Man U', line: '1', odds: 40, stake: 8000,
    hdpGiving: 'home', homeScore: 1, awayScore: 1,
    payout: 0, status: 'loss',
  },
  { kind: 'hdpou', id: 'f2', time: '23:30', home: 'Liverpool', away: 'Man City', betType: 'O/U', pick: 'Over', line: '3', odds: 12, stake: 3000, payout: 0, status: 'loss' },
  { kind: 'hdpou', id: 'f3', time: '03:00', home: 'Real Madrid', away: 'Barcelona', betType: 'HDP', pick: 'Real Madrid', line: '0', odds: -40, stake: 5000, hdpGiving: 'home', homeScore: 2, awayScore: 1, payout: 12500, status: 'win' },
  { kind: 'hdpou', id: 'f4', time: '01:15', home: 'Atletico Madrid', away: 'Sevilla', betType: 'O/U', pick: 'Under', line: '2', odds: -18, stake: 5000, payout: 0, status: 'loss' },
];

const FINISHED_PARLAY: ParlayBet[] = [
  {
    kind: 'parlay', id: 'fp1', time: '20:00',
    picks: [
      { home: 'Arsenal', away: 'Chelsea', pick: 'Arsenal' },
      { home: 'Real Madrid', away: 'Barcelona', pick: 'Real Madrid' },
      { home: 'Bayern Munich', away: 'Dortmund', pick: 'Over 3' },
    ],
    totalOdds: 3.25, stake: 2000, payout: 0, status: 'loss',
  },
  {
    kind: 'parlay', id: 'fp2', time: '22:00',
    picks: [
      { home: 'Liverpool', away: 'Man City', pick: 'Liverpool' },
      { home: 'Napoli', away: 'Juventus', pick: 'Over 2.5' },
    ],
    totalOdds: 2.80, stake: 3000, payout: 8400, status: 'win',
  },
];

const UNFINISHED_HDPOU: HdpOuBet[] = [
  { kind: 'hdpou', id: 'u1', time: '04:00', home: 'Boca Juniors', away: 'River Plate', betType: 'HDP', pick: 'Boca Juniors', line: '0', odds: -34, stake: 5000, payout: 0, status: 'pending' },
  { kind: 'hdpou', id: 'u2', time: '04:30', home: 'Nacional', away: 'Universitario', betType: 'O/U', pick: 'Under', line: '2', odds: -58, stake: 3000, payout: 0, status: 'pending' },
];

const UNFINISHED_PARLAY: ParlayBet[] = [
  {
    kind: 'parlay', id: 'up1', time: '06:30',
    picks: [
      { home: 'LDU Quito', away: 'Lanus', pick: 'LDU Quito' },
      { home: 'Atletico Bucaramanga', away: 'Boca Cali', pick: 'Over 3' },
    ],
    totalOdds: 4.10, stake: 1000, payout: 0, status: 'pending',
  },
];

export const FINISHED_HDPOU_BETS = FINISHED_HDPOU;
export const FINISHED_PARLAY_BETS = FINISHED_PARLAY;
export const UNFINISHED_HDPOU_BETS = UNFINISHED_HDPOU;
export const UNFINISHED_PARLAY_BETS = UNFINISHED_PARLAY;

export const ALL_BETS: Bet[] = [
  ...FINISHED_HDPOU,
  ...FINISHED_PARLAY,
  ...UNFINISHED_HDPOU,
  ...UNFINISHED_PARLAY,
];

export function getBetById(id: string): Bet | undefined {
  return ALL_BETS.find(b => b.id === id);
}

export function formatBetOdds(odds: number) {
  return `${odds > 0 ? '+' : ''}${odds}`;
}

/** Decimal-odds markets (1X2, CS, To Win) — show the multiplier as-is. */
export function isDecimalOddsBetType(betType: HdpOuBet['betType']): boolean {
  return betType === '1X2' || betType === 'CS' || betType === 'To Win';
}

export function formatHdpOuOddsLine(bet: HdpOuBet): string {
  if (isDecimalOddsBetType(bet.betType)) {
    const n = bet.odds > 0 ? bet.odds : Number(bet.line);
    return Number.isFinite(n) && n > 0 ? String(n) : bet.line;
  }
  return `${bet.line} (${formatBetOdds(bet.odds)})`;
}

/** Total return if O/U or non-tier HDP wins at quoted odds. */
export function calcHdpOuPotential(stake: number, odds: number): number {
  return calcHdpQuotedReturn(stake, odds);
}
