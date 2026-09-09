import { PLAY_CALL_VALUES } from './apiDocsParamConfig';

export const SPECIAL_TEAMS_PLAY_CALLS = ['FIELD_GOAL', 'PAT', 'PUNT', 'KICKOFF_NORMAL', 'KICKOFF_ONSIDE', 'KICKOFF_SQUIB'];

const ACTUAL_RESULT_VALUES = [
    'FIRST_DOWN', 'GAIN', 'NO_GAIN', 'LOSS', 'TURNOVER_ON_DOWNS', 'TOUCHDOWN', 'SAFETY', 'TURNOVER',
    'TURNOVER_TOUCHDOWN', 'KICKING_TEAM_TOUCHDOWN', 'RETURN_TOUCHDOWN', 'MUFFED_KICK', 'KICKOFF',
    'SUCCESSFUL_ONSIDE', 'FAILED_ONSIDE', 'GOOD', 'NO_GOOD', 'BLOCKED', 'KICK_SIX', 'DEFENSE_TWO_POINT',
    'SUCCESS', 'FAILED', 'SPIKE', 'KNEEL', 'PUNT', 'PUNT_RETURN_TOUCHDOWN', 'PUNT_TEAM_TOUCHDOWN',
    'MUFFED_PUNT', 'DELAY_OF_GAME', 'END_OF_HALF', 'END_OF_GAME',
];

export const DOWN_OPTIONS = [
    { value: 1, label: '1st down' },
    { value: 2, label: '2nd down' },
    { value: 3, label: '3rd down' },
    { value: 4, label: '4th down' },
];

export const PLAY_TYPE_OPTIONS = [
    { value: 'RUN', label: 'Run' },
    { value: 'PASS', label: 'Pass' },
    { value: 'PAT', label: 'PAT' },
    { value: 'PUNT', label: 'Punt' },
    { value: 'FIELD_GOAL', label: 'Field goal' },
    { value: 'KICKOFF_NORMAL', label: 'Kickoff (normal)' },
    { value: 'KICKOFF_ONSIDE', label: 'Kickoff (onside)' },
    { value: 'KICKOFF_SQUIB', label: 'Kickoff (squib)' },
];

export const SIDE_OPTIONS = [
    { value: 'OFFENSE', label: 'Offense' },
    { value: 'DEFENSE', label: 'Defense' },
    { value: 'SPECIAL_TEAMS', label: 'Special teams' },
];

export const FIELD_POSITION_OPTIONS = [
    { value: 'OWN_TERRITORY', label: 'Own territory' },
    { value: 'OPPONENT_TERRITORY', label: 'Opponent territory' },
    { value: 'RED_ZONE', label: 'Red zone (20)' },
];

export const TEMPO_OPTIONS = [
    { value: 'CHEW', label: 'Chew' },
    { value: 'HURRY', label: 'Hurry' },
];

export const PLAY_COLUMNS = [
    'play_id', 'game_id', 'home_team', 'away_team', 'play_number', 'home_score', 'away_score', 'quarter', 'clock', 'ball_location',
    'possession', 'down', 'yards_to_go', 'defensive_number', 'offensive_number', 'defensive_submitter',
    'offensive_submitter', 'play_call', 'result', 'difference', 'actual_result', 'yards', 'play_time',
    'runoff_time', 'win_probability', 'win_probability_added', 'timeout_used',
    'offensive_timeout_called', 'defensive_timeout_called', 'home_timeouts', 'away_timeouts', 'play_finished',
    'offensive_response_speed', 'defensive_response_speed',
];

export const encodeHiddenColumns = (hiddenColumns) => {
    let mask = 0;
    (hiddenColumns || []).forEach((key) => {
        const index = PLAY_COLUMNS.indexOf(key);
        if (index >= 0) mask += 2 ** index;
    });
    return mask > 0 ? mask.toString(36) : '';
};

export const decodeHiddenColumns = (encoded) => {
    const mask = parseInt(encoded, 36);
    if (!encoded || Number.isNaN(mask)) return [];
    return PLAY_COLUMNS.filter((_, index) => Math.floor(mask / 2 ** index) % 2 === 1);
};

export const CUSTOM_FIELD_CATALOG = [
    { key: 'quarter', label: 'Quarter', type: 'number' },
    { key: 'down', label: 'Down', type: 'number' },
    { key: 'yards_to_go', label: 'Yards to go', type: 'number' },
    { key: 'ball_location', label: 'Ball location', type: 'number' },
    { key: 'yards', label: 'Yards gained', type: 'number' },
    { key: 'play_call', label: 'Play call', type: 'enum', options: PLAY_CALL_VALUES },
    { key: 'actual_result', label: 'Result', type: 'enum', options: ACTUAL_RESULT_VALUES },
    { key: 'possession', label: 'Possession', type: 'enum', options: ['HOME', 'AWAY'] },
    { key: 'offensive_submitter', label: 'Offensive coach', type: 'text' },
    { key: 'defensive_submitter', label: 'Defensive coach', type: 'text' },
];

export const OPERATORS_BY_TYPE = {
    number: [
        { value: 'eq', label: '=' },
        { value: 'neq', label: '≠' },
        { value: 'gt', label: '>' },
        { value: 'gte', label: '≥' },
        { value: 'lt', label: '<' },
        { value: 'lte', label: '≤' },
    ],
    enum: [
        { value: 'eq', label: 'is' },
        { value: 'neq', label: 'is not' },
    ],
    text: [
        { value: 'contains', label: 'contains' },
        { value: 'eq', label: 'equals' },
    ],
};

export const orderedGameIdsFromPlays = (plays) => {
    const seen = new Set();
    const order = [];
    plays.forEach((play) => {
        if (!seen.has(play.game_id)) {
            seen.add(play.game_id);
            order.push(play.game_id);
        }
    });
    return order;
};

export const orderGameIdsByRecency = (gameIds, gameMap, primaryTeam) => [...gameIds].sort((a, b) => {
    const gameA = gameMap[a];
    const gameB = gameMap[b];
    if (!gameA || !gameB) return 0;
    if (gameA.season !== gameB.season) return gameB.season - gameA.season;
    if (gameA.week !== gameB.week) return gameB.week - gameA.week;
    const aPrimary = primaryTeam != null && (gameA.home_team === primaryTeam || gameA.away_team === primaryTeam);
    const bPrimary = primaryTeam != null && (gameB.home_team === primaryTeam || gameB.away_team === primaryTeam);
    if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;
    return b - a;
});

export const fieldPositionOf = (play) => {
    const location = Number(play.ball_location);
    if (Number.isNaN(location)) return null;
    if (location >= 80) return 'RED_ZONE';
    if (location >= 50) return 'OPPONENT_TERRITORY';
    return 'OWN_TERRITORY';
};

export const tempoOf = (play) => {
    if (play.runoff_time === 30) return 'CHEW';
    if (play.runoff_time === 7) return 'HURRY';
    return null;
};

export const classifyPlaySide = (play, mode, target) => {
    const call = String(play.play_call || '').toUpperCase();
    if (SPECIAL_TEAMS_PLAY_CALLS.includes(call)) return 'SPECIAL_TEAMS';
    if (mode === 'coach') {
        if (play.offensive_submitter_id === target) return 'OFFENSE';
        if (play.defensive_submitter_id === target) return 'DEFENSE';
        return null;
    }
    const teamHasBall = (play.possession === 'HOME' && play.home_team === target) || (play.possession === 'AWAY' && play.away_team === target);
    return teamHasBall ? 'OFFENSE' : 'DEFENSE';
};

const matchesCustomFilter = (play, filter) => {
    const field = CUSTOM_FIELD_CATALOG.find((entry) => entry.key === filter.field);
    if (!field || filter.value === '' || filter.value == null) return true;
    const raw = play[field.key];
    if (field.type === 'number') {
        const num = Number(raw);
        const target = Number(filter.value);
        if (Number.isNaN(num) || Number.isNaN(target)) return false;
        switch (filter.operator) {
            case 'eq': return num === target;
            case 'neq': return num !== target;
            case 'gt': return num > target;
            case 'gte': return num >= target;
            case 'lt': return num < target;
            case 'lte': return num <= target;
            default: return true;
        }
    }
    if (field.type === 'enum') {
        const value = String(raw || '').toUpperCase();
        const target = String(filter.value).toUpperCase();
        return filter.operator === 'neq' ? value !== target : value === target;
    }
    const value = String(raw || '').toLowerCase();
    const target = String(filter.value).toLowerCase();
    return filter.operator === 'contains' ? value.includes(target) : value === target;
};

export const applyScenarioFilters = (plays, { mode, target, sides, downs, fieldPositions, playTypes, tempo, customFilters }) => plays.filter((play) => {
    const side = classifyPlaySide(play, mode, target);
    if (sides?.length && !sides.includes(side)) return false;
    if (downs?.length && !downs.includes(play.down)) return false;
    if (fieldPositions?.length && !fieldPositions.includes(fieldPositionOf(play))) return false;
    if (playTypes?.length && !playTypes.includes(String(play.play_call || '').toUpperCase())) return false;
    if (tempo?.length && !tempo.includes(tempoOf(play))) return false;
    if (customFilters?.length && !customFilters.every((filter) => matchesCustomFilter(play, filter))) return false;
    return true;
});

export const NUMBER_MIN = 1;
export const NUMBER_MAX = 1500;
export const DEFAULT_NUMBER_BUCKET_SIZE = 100;

export const buildNumberBuckets = (bucketSize = DEFAULT_NUMBER_BUCKET_SIZE) => {
    const size = Math.max(1, Math.floor(bucketSize) || DEFAULT_NUMBER_BUCKET_SIZE);
    const buckets = [];
    for (let min = NUMBER_MIN; min <= NUMBER_MAX; min += size) {
        const max = Math.min(min + size - 1, NUMBER_MAX);
        buckets.push({ min, max, label: `${min}-${max}` });
    }
    return buckets;
};

export const resolveOwnNumber = (play, target) => {
    if (play.offensive_submitter_id === target) return play.offensive_number;
    if (play.defensive_submitter_id === target) return play.defensive_number;
    return null;
};

const ownNumbersOf = (plays, target) => plays
    .map((play) => resolveOwnNumber(play, target))
    .filter((value) => value != null && !Number.isNaN(Number(value)))
    .map(Number);

export const favoriteNumbers = (plays, target, limit = 10) => {
    const numbers = ownNumbersOf(plays, target);
    const total = numbers.length;
    const counts = new Map();
    numbers.forEach((number) => counts.set(number, (counts.get(number) || 0) + 1));
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([number, count]) => ({ number, count, share: total ? count / total : null }));
};

export const numberBucketCounts = (plays, target, bucketSize = DEFAULT_NUMBER_BUCKET_SIZE) => {
    const numbers = ownNumbersOf(plays, target);
    const total = numbers.length;
    return buildNumberBuckets(bucketSize).map((bucket) => {
        const count = numbers.filter((number) => number >= bucket.min && number <= bucket.max).length;
        return { ...bucket, count, share: total ? count / total : null };
    });
};

const csvEscape = (value) => {
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const playsToCsv = (plays, columns = PLAY_COLUMNS) => {
    const rows = plays.map((play) => columns.map((column) => {
        const value = play[column];
        return typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : value;
    }).map(csvEscape).join(','));
    return [columns.join(','), ...rows].join('\n');
};

export const downloadCsv = (filename, csvText) => {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
