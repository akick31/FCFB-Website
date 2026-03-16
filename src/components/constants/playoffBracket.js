// ─── Playoff Bracket Constants ────────────────────────────────────────

// Official CFP logo
export const CFP_LOGO_URL = 'https://am-prod-client-files.ppub-tmaws.io/cfbplayoff/s3fs-public/CFP%20Symbol%20Gold%20PMS%20Dark%20BG.PNG';

// R2 bye seeds in bracket position order (byeSeed + r1HighSeed = 17)
// This defines which bye team (seeds 1-8) faces which R1 winner in Round 2
export const R2_BYE_SEEDS = [1, 8, 4, 5, 3, 6, 2, 7];

// Round 1 game matchups (high seed vs low seed)
export const R1_GAMES = [
    { highSeed: 16, lowSeed: 17 },
    { highSeed: 9,  lowSeed: 24 },
    { highSeed: 13, lowSeed: 20 },
    { highSeed: 12, lowSeed: 21 },
    { highSeed: 14, lowSeed: 19 },
    { highSeed: 11, lowSeed: 22 },
    { highSeed: 15, lowSeed: 18 },
    { highSeed: 10, lowSeed: 23 },
];

// Round 2 opponent matchups from Round 1 (for reference)
export const R2_OPPONENT_R1 = [
    { h: 16, l: 17 }, { h: 9, l: 24 }, { h: 13, l: 20 }, { h: 12, l: 21 },
    { h: 14, l: 19 }, { h: 11, l: 22 }, { h: 15, l: 18 }, { h: 10, l: 23 },
];

// Round labels
export const ROUND_LABELS = {
    1: 'First Round',
    2: 'Second Round',
    3: 'Quarterfinals',
    4: 'Semifinals',
    5: 'National Championship',
};

// Compute playoff week from round number: Round 1 = Week 14, Round 2 = Week 15, etc.
export const playoffWeekForRound = (round) => 13 + round;
