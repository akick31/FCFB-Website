export const MIN_PLAYS_STEP = 5;
export const DEFAULT_MIN_PLAYS_PERCENT = 60;

const PLAY_COUNT_KEY = 'offensive_play_count';

const roundToStep = (value) => Math.max(0, Math.round(value / MIN_PLAYS_STEP) * MIN_PLAYS_STEP);

const ATTEMPT_MINIMUMS_PER_GAME = {
    pass_attempts: 10,
    rush_attempts: 10,
    third_down_conversion_attempts: 5,
    fourth_down_conversion_attempts: 1,
    red_zone_attempts: 1.2,
    number_of_drives: 3,
    field_goal_attempts: 0.6,
    punts_attempted: 1,
    punt_count: 1,
    onside_attempts: 0.15,
    normal_kickoff_attempts: 1.5,
    number_of_kickoffs: 1.5,
};

export const gamesPlayed = (row) => (row?.wins || 0) + (row?.losses || 0);

export const perGame = (row, key) => {
    const games = gamesPlayed(row);
    return games ? (row?.[key] || 0) / games : 0;
};

export const averagePlaysPerGame = (rows) => {
    const rates = (rows || []).filter((row) => gamesPlayed(row) > 0).map((row) => perGame(row, PLAY_COUNT_KEY)).filter((rate) => rate > 0);
    return rates.length ? rates.reduce((total, rate) => total + rate, 0) / rates.length : 0;
};

export const maxPlaysPerGame = (rows) => (rows || []).reduce(
    (best, row) => (gamesPlayed(row) > 0 ? Math.max(best, perGame(row, PLAY_COUNT_KEY)) : best),
    0,
);

export const defaultMinPlays = (averagePerGame) => roundToStep((averagePerGame * DEFAULT_MIN_PLAYS_PERCENT) / 100);

const denominatorOf = (stat) => {
    const agg = stat?.agg?.agg;
    if (agg === 'rate' || agg === 'ratio') return stat.agg.den;
    return null;
};

export const attemptMinimumFor = (stat) => {
    const denominator = denominatorOf(stat);
    if (!denominator) return null;
    const perGameMinimum = ATTEMPT_MINIMUMS_PER_GAME[denominator.replace(/^opponent_/, '')];
    return perGameMinimum == null ? null : { field: denominator, perGame: perGameMinimum };
};

export const qualifiesForStat = (row, stat, minPlaysPerGame) => {
    if (minPlaysPerGame <= 0) return true;
    if (gamesPlayed(row) === 0) return true;
    if (perGame(row, PLAY_COUNT_KEY) < minPlaysPerGame) return false;
    const attempts = attemptMinimumFor(stat);
    return !attempts || perGame(row, attempts.field) >= attempts.perGame;
};

export const filterByMinPlays = (rows, minPlaysPerGame) =>
    (minPlaysPerGame > 0
        ? (rows || []).filter((row) => gamesPlayed(row) === 0 || perGame(row, PLAY_COUNT_KEY) >= minPlaysPerGame)
        : rows || []);

export const filterByAttemptsPerGame = (rows, field, minimum) =>
    (minimum > 0 ? (rows || []).filter((row) => gamesPlayed(row) > 0 && perGame(row, field) >= minimum) : rows || []);

export const parseMinPlays = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};
