// ─── Playoff Bracket Constants ────────────────────────────────────────

// Official CFP logo
export const CFP_LOGO_URL = 'https://cfbuniform.com/wp-content/uploads/2025/03/Logo_of_college_football_playoff.svg.png';

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

// QF bracket position groups: all seeds that can appear in each QF slot (bye + their R1 opponents).
// QF 0 (top):    1 vs 8 region  → seeds 1,16,17 and 8,9,24
// QF 1:          4 vs 5 region  → seeds 4,13,20 and 5,12,21
// QF 2:          3 vs 6 region  → seeds 3,14,19 and 6,11,22
// QF 3 (bottom): 2 vs 7 region  → seeds 2,15,18 and 7,10,23
export const QF_SEED_GROUPS = [
    [1, 16, 17, 8, 9, 24],
    [4, 13, 20, 5, 12, 21],
    [3, 14, 19, 6, 11, 22],
    [2, 15, 18, 7, 10, 23],
];

// SF bracket position groups: union of two QF regions each
export const SF_SEED_GROUPS = [
    [1, 16, 17, 8, 9, 24, 4, 13, 20, 5, 12, 21],
    [3, 14, 19, 6, 11, 22, 2, 15, 18, 7, 10, 23],
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
