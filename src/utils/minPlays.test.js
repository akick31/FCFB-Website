import {
    averagePlaysPerGame,
    maxPlaysPerGame,
    defaultMinPlays,
    filterByMinPlays,
    qualifiesForStat,
    attemptMinimumFor,
    gamesPlayed,
    parseMinPlays,
    MIN_PLAYS_STEP,
} from './minPlays';
import { STAT_BY_KEY } from './statsCatalog';

const team = (overrides) => ({ wins: 2, losses: 2, ...overrides });

const rows = [
    team({ team: 'Fast', offensive_play_count: 240 }),
    team({ team: 'Normal', offensive_play_count: 176 }),
    team({ team: 'Slow', offensive_play_count: 84 }),
    team({ team: 'Unplayed', wins: 0, losses: 0, offensive_play_count: 0 }),
];

test('league average is plays per game, ignoring teams that have not played', () => {
    expect(averagePlaysPerGame(rows)).toBeCloseTo(41.67, 2);
    expect(averagePlaysPerGame([])).toBe(0);
});

test('default minimum is a share of the average rounded to a multiple of five', () => {
    expect(defaultMinPlays(44.3)).toBe(25);
    expect(defaultMinPlays(0)).toBe(0);
    expect(defaultMinPlays(44.3) % MIN_PLAYS_STEP).toBe(0);
});

test('filtering compares plays per game and keeps rows with no game count', () => {
    expect(filterByMinPlays(rows, 25).map((row) => row.team)).toEqual(['Fast', 'Normal', 'Unplayed']);
    expect(filterByMinPlays(rows, 0)).toHaveLength(4);
    expect(gamesPlayed(rows[3])).toBe(0);
});

test('a missing game count never empties a board', () => {
    const noGameCount = { offensive_play_count: 400, pass_attempts: 200 };

    expect(qualifiesForStat(noGameCount, STAT_BY_KEY.pass_success_percentage, 25)).toBe(true);
});

test('the cap is the highest plays per game on the board', () => {
    expect(maxPlaysPerGame(rows)).toBe(60);
    expect(maxPlaysPerGame([])).toBe(0);
});

test('rate stats also require attempts per game in their own denominator', () => {
    const stat = STAT_BY_KEY.pass_success_percentage;
    expect(attemptMinimumFor(stat)).toEqual({ field: 'pass_attempts', perGame: 10 });

    const volumePasser = team({ offensive_play_count: 176, pass_attempts: 100 });
    const tokenPasser = team({ offensive_play_count: 176, pass_attempts: 3 });

    expect(qualifiesForStat(volumePasser, stat, 25)).toBe(true);
    expect(qualifiesForStat(tokenPasser, stat, 25)).toBe(false);
    expect(qualifiesForStat(tokenPasser, stat, 0)).toBe(true);
});

test('opponent rates read the opponent denominator minimum', () => {
    expect(attemptMinimumFor(STAT_BY_KEY.opponent_third_down_conversion_percentage)).toEqual({
        field: 'opponent_third_down_conversion_attempts',
        perGame: 5,
    });
});

test('per play averages fall back to the play count alone', () => {
    const stat = STAT_BY_KEY.average_offensive_diff;
    expect(attemptMinimumFor(stat)).toBeNull();
    expect(qualifiesForStat(team({ offensive_play_count: 176 }), stat, 25)).toBe(true);
    expect(qualifiesForStat(team({ offensive_play_count: 84 }), stat, 25)).toBe(false);
});

test('minimum play parameters accept zero and reject junk', () => {
    expect(parseMinPlays('0')).toBe(0);
    expect(parseMinPlays('25')).toBe(25);
    expect(parseMinPlays('-5')).toBeNull();
    expect(parseMinPlays('abc')).toBeNull();
    expect(parseMinPlays(null)).toBeNull();
});

test('rate and average stats are volume sensitive while counting stats are not', () => {
    expect(STAT_BY_KEY.average_yards_per_play.rateBased).toBe(true);
    expect(STAT_BY_KEY.third_down_conversion_percentage.rateBased).toBe(true);
    expect(STAT_BY_KEY.average_offensive_diff.rateBased).toBe(true);
    expect(STAT_BY_KEY.total_yards.rateBased).toBe(false);
    expect(STAT_BY_KEY.longest_pass.rateBased).toBe(false);
});
