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
        ['total_yards', 'Total yards'], ['pass_yards', 'Passing yards'], ['rush_yards', 'Rushing yards'],
        ['touchdowns', 'Touchdowns'], ['pass_touchdowns', 'Passing touchdowns'], ['rush_touchdowns', 'Rushing touchdowns'],
        ['first_downs', 'First downs'], ['average_yards_per_play', 'Yards per play'],
        ['pass_attempts', 'Pass attempts'], ['pass_completions', 'Pass completions'], ['pass_completion_percentage', 'Completion %'],
        ['pass_successes', 'Pass successes'], ['pass_success_percentage', 'Pass success %'],
        ['rush_attempts', 'Rush attempts'], ['rush_successes', 'Rush successes'], ['rush_success_percentage', 'Rush success %'],
        ['longest_pass', 'Longest pass'], ['longest_run', 'Longest run'],
        ['red_zone_attempts', 'Red zone trips'], ['red_zone_successes', 'Red zone scores'], ['red_zone_success_percentage', 'Red zone %'],
        ['third_down_conversion_success', 'Third downs converted'], ['third_down_conversion_percentage', 'Third down %'],
        ['fourth_down_conversion_success', 'Fourth downs converted'], ['fourth_down_conversion_percentage', 'Fourth down %'],
        ['time_of_possession', 'Time of possession'], ['number_of_drives', 'Drives'], ['largest_lead', 'Largest lead'],
    ]],
    ['Defense', [
        ['sacks_forced', 'Sacks'], ['opponent_total_yards', 'Yards allowed'], ['opponent_pass_yards', 'Pass yards allowed'],
        ['opponent_rush_yards', 'Rush yards allowed'], ['opponent_touchdowns', 'Touchdowns allowed'],
        ['opponent_pass_touchdowns', 'Pass TDs allowed'], ['opponent_rush_touchdowns', 'Rush TDs allowed'],
        ['opponent_first_downs', 'First downs allowed'], ['opponent_average_yards_per_play', 'Yards per play allowed'],
        ['opponent_third_down_conversion_percentage', 'Third down % allowed'], ['opponent_fourth_down_conversion_percentage', 'Fourth down % allowed'],
        ['opponent_red_zone_success_percentage', 'Red zone % allowed'], ['largest_deficit', 'Largest deficit'],
    ]],
    ['Turnovers', [
        ['turnover_differential', 'Turnover differential'], ['turnovers_forced', 'Turnovers forced'], ['turnovers_lost', 'Turnovers lost'],
        ['interceptions_forced', 'Interceptions forced'], ['interceptions_lost', 'Interceptions thrown'],
        ['fumbles_forced', 'Fumbles forced'], ['fumbles_lost', 'Fumbles lost'],
        ['pick_sixes_forced', 'Pick sixes'], ['pick_sixes_thrown', 'Pick sixes thrown'],
        ['turnover_touchdowns_forced', 'Turnover TDs'], ['turnover_touchdowns_lost', 'Turnover TDs allowed'],
        ['fumble_return_tds_forced', 'Fumble return TDs'], ['fumble_return_tds_committed', 'Fumble return TDs allowed'],
        ['safeties_forced', 'Safeties forced'], ['safeties_committed', 'Safeties committed'], ['sacks_allowed', 'Sacks allowed'],
    ]],
    ['Special teams', [
        ['field_goal_made', 'Field goals made'], ['field_goal_attempts', 'Field goal attempts'], ['field_goal_percentage', 'Field goal %'],
        ['longest_field_goal', 'Longest field goal'], ['field_goal_touchdown', 'Field goal return TDs'],
        ['blocked_opponent_field_goals', 'Field goals blocked'], ['blocked_opponent_punt', 'Punts blocked'],
        ['punts_attempted', 'Punts'], ['longest_punt', 'Longest punt'], ['average_punt_length', 'Average punt'],
        ['kick_return_td', 'Kick return TDs'], ['punt_return_td', 'Punt return TDs'],
        ['touchbacks', 'Touchbacks'], ['touchback_percentage', 'Touchback %'],
        ['onside_attempts', 'Onside attempts'], ['onside_success', 'Onside recoveries'], ['onside_success_percentage', 'Onside %'],
    ]],
    ['Ratings & record', [
        ['wins', 'Wins'], ['losses', 'Losses'],
        ['average_offensive_diff', 'Average offensive difference'], ['average_defensive_diff', 'Average defensive difference'],
        ['average_offensive_special_teams_diff', 'Average offensive special teams difference'], ['average_defensive_special_teams_diff', 'Average defensive special teams difference'],
        ['average_response_speed', 'Average response time'],
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

export const STAT_CATALOG = STAT_GROUPS.flatMap(([group, items]) => items.map(([key, label]) => ({
    key,
    label,
    group,
    ascending: LOWER_IS_BETTER.has(key),
    format: formatterFor(key),
})));

export const STAT_BY_KEY = Object.fromEntries(STAT_CATALOG.map((stat) => [stat.key, stat]));

export const buildLeaderboard = (rows, stat) => {
    if (!stat) return [];
    const valid = rows.filter((row) => row[stat.key] != null && !Number.isNaN(Number(row[stat.key])));
    return valid.sort((a, b) => (stat.ascending ? a[stat.key] - b[stat.key] : b[stat.key] - a[stat.key]));
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
