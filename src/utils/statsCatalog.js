import { sum, max, mean, rate, yardsPerPlay, weightedAverage } from './statAggregation';

const PERCENT = new Set([
    'pass_completion_percentage', 'pass_success_percentage', 'rush_success_percentage', 'red_zone_success_percentage',
    'third_down_conversion_percentage', 'fourth_down_conversion_percentage', 'field_goal_percentage', 'touchback_percentage',
    'onside_success_percentage', 'kick_return_td_percentage', 'punt_return_td_percentage',
    'opponent_pass_completion_percentage', 'opponent_rush_success_percentage', 'opponent_red_zone_success_percentage',
    'opponent_third_down_conversion_percentage', 'opponent_fourth_down_conversion_percentage',
]);

const DECIMAL = new Set(['average_yards_per_play', 'opponent_average_yards_per_play', 'average_punt_length', 'opponent_average_punt_length']);

const TIME = new Set(['time_of_possession', 'opponent_time_of_possession', 'average_response_speed']);

const LOWER_IS_BETTER = new Set([
    'losses', 'average_response_speed', 'average_offensive_diff', 'average_offensive_special_teams_diff', 'largest_deficit',
    'turnovers_lost', 'interceptions_lost', 'fumbles_lost', 'pick_sixes_thrown', 'turnover_touchdowns_lost',
    'fumble_return_tds_committed', 'safeties_committed', 'sacks_allowed',
    'opponent_total_yards', 'opponent_pass_yards', 'opponent_rush_yards', 'opponent_pass_touchdowns', 'opponent_rush_touchdowns',
    'opponent_touchdowns', 'opponent_first_downs', 'opponent_average_yards_per_play', 'opponent_pass_successes', 'opponent_rush_successes',
    'opponent_third_down_conversion_success', 'opponent_third_down_conversion_percentage',
    'opponent_fourth_down_conversion_success', 'opponent_fourth_down_conversion_percentage',
    'opponent_red_zone_successes', 'opponent_red_zone_success_percentage',
]);

export const STAT_GROUPS = [
    ['Offense', [
        ['total_yards', 'Total yards', { agg: 'sum' }], ['pass_yards', 'Passing yards', { agg: 'sum' }], ['rush_yards', 'Rushing yards', { agg: 'sum' }],
        ['touchdowns', 'Touchdowns', { agg: 'sum' }], ['pass_touchdowns', 'Passing touchdowns', { agg: 'sum' }], ['rush_touchdowns', 'Rushing touchdowns', { agg: 'sum' }],
        ['first_downs', 'First downs', { agg: 'sum' }], ['average_yards_per_play', 'Yards per play', { agg: 'ypp', yards: 'total_yards' }],
        ['pass_attempts', 'Pass attempts', { agg: 'sum' }], ['pass_completions', 'Pass completions', { agg: 'sum' }], ['pass_completion_percentage', 'Completion %', { agg: 'rate', num: 'pass_completions', den: 'pass_attempts' }],
        ['pass_successes', 'Pass successes', { agg: 'sum' }], ['pass_success_percentage', 'Pass success %', { agg: 'rate', num: 'pass_successes', den: 'pass_attempts' }],
        ['rush_attempts', 'Rush attempts', { agg: 'sum' }], ['rush_successes', 'Rush successes', { agg: 'sum' }], ['rush_success_percentage', 'Rush success %', { agg: 'rate', num: 'rush_successes', den: 'rush_attempts' }],
        ['longest_pass', 'Longest pass', { agg: 'max' }], ['longest_run', 'Longest run', { agg: 'max' }],
        ['red_zone_attempts', 'Red zone trips', { agg: 'sum' }], ['red_zone_successes', 'Red zone scores', { agg: 'sum' }], ['red_zone_success_percentage', 'Red zone %', { agg: 'rate', num: 'red_zone_successes', den: 'red_zone_attempts' }],
        ['third_down_conversion_success', 'Third downs converted', { agg: 'sum' }], ['third_down_conversion_percentage', 'Third down %', { agg: 'rate', num: 'third_down_conversion_success', den: 'third_down_conversion_attempts' }],
        ['fourth_down_conversion_success', 'Fourth downs converted', { agg: 'sum' }], ['fourth_down_conversion_percentage', 'Fourth down %', { agg: 'rate', num: 'fourth_down_conversion_success', den: 'fourth_down_conversion_attempts' }],
        ['time_of_possession', 'Time of possession', { agg: 'sum' }], ['number_of_drives', 'Drives', { agg: 'sum' }], ['largest_lead', 'Largest lead', { agg: 'max' }],
    ]],
    ['Defense', [
        ['sacks_forced', 'Sacks', { agg: 'sum' }], ['opponent_total_yards', 'Yards allowed', { agg: 'sum' }], ['opponent_pass_yards', 'Pass yards allowed', { agg: 'sum' }],
        ['opponent_rush_yards', 'Rush yards allowed', { agg: 'sum' }], ['opponent_touchdowns', 'Touchdowns allowed', { agg: 'sum' }],
        ['opponent_pass_touchdowns', 'Pass TDs allowed', { agg: 'sum' }], ['opponent_rush_touchdowns', 'Rush TDs allowed', { agg: 'sum' }],
        ['opponent_first_downs', 'First downs allowed', { agg: 'sum' }], ['opponent_average_yards_per_play', 'Yards per play allowed', { agg: 'ypp', yards: 'opponent_total_yards' }],
        ['opponent_third_down_conversion_percentage', 'Third down % allowed', { agg: 'rate', num: 'opponent_third_down_conversion_success', den: 'opponent_third_down_conversion_attempts' }],
        ['opponent_fourth_down_conversion_percentage', 'Fourth down % allowed', { agg: 'rate', num: 'opponent_fourth_down_conversion_success', den: 'opponent_fourth_down_conversion_attempts' }],
        ['opponent_red_zone_success_percentage', 'Red zone % allowed', { agg: 'rate', num: 'opponent_red_zone_successes', den: 'opponent_red_zone_attempts' }], ['largest_deficit', 'Largest deficit', { agg: 'max' }],
    ]],
    ['Turnovers', [
        ['turnover_differential', 'Turnover differential', { agg: 'sum' }], ['turnovers_forced', 'Turnovers forced', { agg: 'sum' }], ['turnovers_lost', 'Turnovers lost', { agg: 'sum' }],
        ['interceptions_forced', 'Interceptions forced', { agg: 'sum' }], ['interceptions_lost', 'Interceptions thrown', { agg: 'sum' }],
        ['fumbles_forced', 'Fumbles forced', { agg: 'sum' }], ['fumbles_lost', 'Fumbles lost', { agg: 'sum' }],
        ['pick_sixes_forced', 'Pick sixes', { agg: 'sum' }], ['pick_sixes_thrown', 'Pick sixes thrown', { agg: 'sum' }],
        ['turnover_touchdowns_forced', 'Turnover TDs', { agg: 'sum' }], ['turnover_touchdowns_lost', 'Turnover TDs allowed', { agg: 'sum' }],
        ['fumble_return_tds_forced', 'Fumble return TDs', { agg: 'sum' }], ['fumble_return_tds_committed', 'Fumble return TDs allowed', { agg: 'sum' }],
        ['safeties_forced', 'Safeties forced', { agg: 'sum' }], ['safeties_committed', 'Safeties committed', { agg: 'sum' }], ['sacks_allowed', 'Sacks allowed', { agg: 'sum' }],
    ]],
    ['Special teams', [
        ['field_goal_made', 'Field goals made', { agg: 'sum' }], ['field_goal_attempts', 'Field goal attempts', { agg: 'sum' }], ['field_goal_percentage', 'Field goal %', { agg: 'rate', num: 'field_goal_made', den: 'field_goal_attempts' }],
        ['longest_field_goal', 'Longest field goal', { agg: 'max' }], ['field_goal_touchdown', 'Field goal return TDs', { agg: 'sum' }],
        ['blocked_opponent_field_goals', 'Field goals blocked', { agg: 'sum' }], ['blocked_opponent_punt', 'Punts blocked', { agg: 'sum' }],
        ['punts_attempted', 'Punts', { agg: 'sum' }], ['longest_punt', 'Longest punt', { agg: 'max' }], ['average_punt_length', 'Average punt', { agg: 'wavg', weight: 'punts_attempted' }],
        ['kick_return_td', 'Kick return TDs', { agg: 'sum' }], ['punt_return_td', 'Punt return TDs', { agg: 'sum' }],
        ['touchbacks', 'Touchbacks', { agg: 'sum' }], ['touchback_percentage', 'Touchback %', { agg: 'rate', num: 'touchbacks', den: 'number_of_kickoffs' }],
        ['onside_attempts', 'Onside attempts', { agg: 'sum' }], ['onside_success', 'Onside recoveries', { agg: 'sum' }], ['onside_success_percentage', 'Onside %', { agg: 'rate', num: 'onside_success', den: 'onside_attempts' }],
    ]],
    ['Ratings & record', [
        ['wins', 'Wins', { agg: 'sum' }], ['losses', 'Losses', { agg: 'sum' }],
        ['average_offensive_diff', 'Average offensive difference', { agg: 'mean' }], ['average_defensive_diff', 'Average defensive difference', { agg: 'mean' }],
        ['average_offensive_special_teams_diff', 'Average offensive special teams difference', { agg: 'mean' }], ['average_defensive_special_teams_diff', 'Average defensive special teams difference', { agg: 'mean' }],
        ['average_response_speed', 'Average response time', { agg: 'mean' }],
    ]],
];

export const formatTime = (seconds) => {
    const total = Math.max(0, Math.round(Number(seconds)));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};

const formatterFor = (key) => {
    if (TIME.has(key)) return formatTime;
    if (PERCENT.has(key)) return (value) => `${Number(value).toFixed(1)}%`;
    if (DECIMAL.has(key)) return (value) => Number(value).toFixed(2);
    return (value) => Math.round(Number(value)).toLocaleString();
};

export const STAT_CATALOG = STAT_GROUPS.flatMap(([group, items]) => items.map(([key, label, agg]) => ({
    key,
    label,
    group,
    agg,
    ascending: LOWER_IS_BETTER.has(key),
    format: formatterFor(key),
})));

export const STAT_BY_KEY = Object.fromEntries(STAT_CATALOG.map((stat) => [stat.key, stat]));

export const buildLeaderboard = (rows, stat) => {
    if (!stat) return [];
    const valid = rows.filter((row) => row[stat.key] != null && !Number.isNaN(Number(row[stat.key])));
    return valid.sort((a, b) => (stat.ascending ? a[stat.key] - b[stat.key] : b[stat.key] - a[stat.key]));
};

export const aggregateStatRows = (rows, fieldAggs) => {
    const result = {};
    const latestRow = rows.reduce(
        (best, row) => ((row.season_number ?? row.seasonNumber ?? 0) > (best?.season_number ?? best?.seasonNumber ?? 0) ? row : best),
        rows[0],
    );
    Object.entries(fieldAggs).forEach(([key, spec]) => {
        if (spec === 'latest') { result[key] = latestRow?.[key]; return; }
        const { agg, num, den, yards, weight } = spec;
        if (agg === 'sum') result[key] = sum(rows, key);
        else if (agg === 'max') result[key] = max(rows, key);
        else if (agg === 'mean') result[key] = mean(rows, key);
        else if (agg === 'rate') result[key] = rate(rows, num, den);
        else if (agg === 'ypp') result[key] = yardsPerPlay(rows, yards, key);
        else if (agg === 'wavg') result[key] = weightedAverage(rows, key, weight);
    });
    return result;
};

export const aggregateStatRowsByKey = (rows, keyField, fieldAggs) => {
    const byKey = {};
    rows.forEach((row) => {
        const key = row[keyField];
        if (key == null) return;
        (byKey[key] = byKey[key] || []).push(row);
    });
    return Object.entries(byKey).map(([key, groupRows]) => ({ [keyField]: key, ...aggregateStatRows(groupRows, fieldAggs) }));
};

export const aggregateAllTimeStats = (rows) => {
    const byTeam = {};
    (rows || []).forEach((row) => {
        if (!row.team) return;
        (byTeam[row.team] = byTeam[row.team] || []).push(row);
    });
    return Object.entries(byTeam).map(([team, teamRows]) => {
        const latest = teamRows.reduce((best, row) => ((row.season_number || 0) > (best.season_number || 0) ? row : best), teamRows[0]);
        const result = { team, conference: latest.conference };
        STAT_CATALOG.forEach((stat) => {
            if (!stat.agg) return;
            const { agg, num, den, yards, weight } = stat.agg;
            if (agg === 'sum') result[stat.key] = sum(teamRows, stat.key);
            else if (agg === 'max') result[stat.key] = max(teamRows, stat.key);
            else if (agg === 'mean') result[stat.key] = mean(teamRows, stat.key);
            else if (agg === 'rate') result[stat.key] = rate(teamRows, num, den);
            else if (agg === 'ypp') result[stat.key] = yardsPerPlay(teamRows, yards, stat.key);
            else if (agg === 'wavg') result[stat.key] = weightedAverage(teamRows, stat.key, weight);
        });
        return result;
    });
};

export const seasonHasStarted = (season) => Boolean(season?.start_date || season?.end_date || season?.national_championship_winning_team);

export const formatValue = (value, type) => {
    if (value == null) return '-';
    if (type === 'pct') return `${Number(value).toFixed(1)}%`;
    if (type === 'dec') return Number(value).toFixed(2);
    if (type === 'time') return formatTime(value);
    return Math.round(Number(value)).toLocaleString();
};

export const LEAGUE_STAT_GROUPS = [
    ['Offense', [
        ['total_yards', 'Total yards', 'int'], ['pass_yards', 'Passing yards', 'int'], ['rush_yards', 'Rushing yards', 'int'],
        ['pass_touchdowns', 'Passing touchdowns', 'int'], ['rush_touchdowns', 'Rushing touchdowns', 'int'], ['first_downs', 'First downs', 'int'],
        ['average_yards_per_play', 'Yards per play', 'dec'], ['pass_attempts', 'Pass attempts', 'int'], ['pass_completions', 'Pass completions', 'int'],
        ['pass_completion_percentage', 'Completion %', 'pct'], ['pass_successes', 'Pass successes', 'int'], ['pass_success_percentage', 'Pass success %', 'pct'],
        ['pass_interceptions', 'Interceptions thrown', 'int'], ['longest_pass', 'Longest pass', 'int'], ['rush_attempts', 'Rush attempts', 'int'],
        ['rush_successes', 'Rush successes', 'int'], ['rush_success_percentage', 'Rush success %', 'pct'], ['longest_run', 'Longest run', 'int'],
    ]],
    ['Defense', [
        ['sacks_forced', 'Sacks', 'int'], ['sacks_allowed', 'Sacks allowed', 'int'], ['interceptions_forced', 'Interceptions forced', 'int'],
        ['fumbles_forced', 'Fumbles forced', 'int'], ['fumbles_recovered', 'Fumbles recovered', 'int'], ['defensive_touchdowns', 'Defensive touchdowns', 'int'],
    ]],
    ['Special teams', [
        ['field_goals_made', 'Field goals made', 'int'], ['field_goals_attempted', 'Field goal attempts', 'int'], ['field_goal_percentage', 'Field goal %', 'pct'],
        ['longest_field_goal', 'Longest field goal', 'int'], ['punts', 'Punts', 'int'], ['longest_punt', 'Longest punt', 'int'],
        ['kickoff_return_touchdowns', 'Kick return TDs', 'int'], ['punt_return_touchdowns', 'Punt return TDs', 'int'],
    ]],
    ['Ratings & pace', [
        ['average_offensive_diff', 'Average offensive difference', 'dec'], ['average_defensive_diff', 'Average defensive difference', 'dec'],
        ['average_offensive_special_teams_diff', 'Average offensive special teams difference', 'dec'], ['average_defensive_special_teams_diff', 'Average defensive special teams difference', 'dec'],
        ['average_diff', 'Average overall difference', 'dec'], ['average_response_speed', 'Average response time', 'time'],
    ]],
];

export const CONFERENCE_COLUMNS = [
    ['total_teams', 'Teams', 'int'], ['total_yards', 'Total Yds', 'int'], ['average_yards_per_play', 'Yds/Play', 'dec'],
    ['pass_touchdowns', 'Pass TD', 'int'], ['rush_touchdowns', 'Rush TD', 'int'], ['first_downs', '1st Downs', 'int'],
    ['third_down_conversion_percentage', '3rd %', 'pct'], ['red_zone_success_percentage', 'RZ %', 'pct'],
    ['sacks_forced', 'Sacks', 'int'], ['interceptions_forced', 'INT', 'int'], ['turnover_differential', 'TO Diff', 'int'],
    ['longest_field_goal', 'Long FG', 'int'], ['average_punt_length', 'Avg Punt', 'dec'], ['average_response_speed', 'Resp Time', 'time'],
    ['average_offensive_diff', 'Off Diff', 'dec'], ['average_defensive_diff', 'Def Diff', 'dec'],
];
