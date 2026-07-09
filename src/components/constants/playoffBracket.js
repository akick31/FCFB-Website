export const CFP_LOGO_URL = 'https://cfbuniform.com/wp-content/uploads/2025/03/Logo_of_college_football_playoff.svg.png';

export const R2_BYE_SEEDS = [1, 8, 4, 5, 3, 6, 2, 7];

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

export const R2_OPPONENT_R1 = [
    { h: 16, l: 17 }, { h: 9, l: 24 }, { h: 13, l: 20 }, { h: 12, l: 21 },
    { h: 14, l: 19 }, { h: 11, l: 22 }, { h: 15, l: 18 }, { h: 10, l: 23 },
];

export const QF_SEED_GROUPS = [
    [1, 16, 17, 8, 9, 24],
    [4, 13, 20, 5, 12, 21],
    [3, 14, 19, 6, 11, 22],
    [2, 15, 18, 7, 10, 23],
];

export const SF_SEED_GROUPS = [
    [1, 16, 17, 8, 9, 24, 4, 13, 20, 5, 12, 21],
    [3, 14, 19, 6, 11, 22, 2, 15, 18, 7, 10, 23],
];

export const ROUND_LABELS = {
    1: 'First Round',
    2: 'Second Round',
    3: 'Quarterfinal',
    4: 'Semifinal',
    5: 'National Championship',
};

export const playoffWeekForRound = (round) => 13 + round;
