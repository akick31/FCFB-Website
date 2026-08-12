export const RECORD_GROUPS = [
    ['Scoring', ['q1_score', 'q2_score', 'q3_score', 'q4_score', 'score', 'touchdowns', 'largest_lead', 'largest_deficit', 'largest_spread', 'largest_upset']],
    ['Passing', ['pass_yards', 'pass_touchdowns', 'longest_pass', 'pass_attempts', 'pass_completions', 'pass_completion_percentage', 'pass_successes', 'pass_success_percentage']],
    ['Rushing', ['rush_yards', 'rush_touchdowns', 'longest_run', 'rush_attempts', 'rush_successes', 'rush_success_percentage']],
    ['Offense', ['total_yards', 'average_yards_per_play', 'first_downs', 'third_down_conversion_success', 'third_down_conversion_attempts', 'third_down_conversion_percentage', 'fourth_down_conversion_success', 'fourth_down_conversion_attempts', 'fourth_down_conversion_percentage', 'red_zone_successes', 'red_zone_attempts', 'red_zone_success_percentage', 'red_zone_percentage', 'time_of_possession', 'number_of_drives', 'sacks_allowed']],
    ['Defense', ['sacks_forced', 'interceptions_forced', 'fumbles_forced', 'points_against', 'total_yards_against', 'pass_yards_against', 'rush_yards_against', 'first_downs_against', 'touchdowns_against', 'third_down_conversion_percentage_against', 'fourth_down_conversion_percentage_against', 'red_zone_success_percentage_against']],
    ['Turnovers', ['turnover_differential', 'turnovers_forced', 'turnovers_lost', 'interceptions_lost', 'fumbles_lost', 'pick_sixes_forced', 'pick_sixes_thrown', 'turnover_touchdowns_forced', 'turnover_touchdowns_lost', 'fumble_return_tds_forced', 'fumble_return_tds_committed', 'safeties_forced', 'safeties_committed']],
    ['Special teams', ['field_goal_made', 'field_goal_attempts', 'field_goal_percentage', 'field_goal_touchdown', 'longest_field_goal', 'blocked_opponent_field_goals', 'blocked_opponent_punt', 'punts_attempted', 'average_punt_length', 'longest_punt', 'punt_return_td', 'punt_return_td_percentage', 'kick_return_td', 'kick_return_td_percentage', 'touchbacks', 'touchback_percentage', 'onside_attempts', 'onside_success', 'onside_success_percentage', 'normal_kickoff_attempts', 'number_of_kickoffs']],
    ['Ratings', ['average_diff', 'average_offensive_diff', 'average_defensive_diff', 'average_offensive_special_teams_diff', 'average_defensive_special_teams_diff', 'average_response_speed']],
];

export const RECORD_GROUP_ORDER = RECORD_GROUPS.map(([group]) => group);

const GROUP_BY_KEY = {};
const ORDER_BY_KEY = {};
RECORD_GROUPS.forEach(([group, keys]) => {
    keys.forEach((key, index) => {
        GROUP_BY_KEY[key] = group;
        ORDER_BY_KEY[key] = index;
    });
});

const SEASON_GROUP_OVERRIDES = { touchdowns: 'Offense' };
const SEASON_ORDER_OVERRIDES = { touchdowns: -1 };

export const recordGroup = (recordName, { seasonView = false } = {}) => {
    const key = String(recordName).toLowerCase();
    if (seasonView && SEASON_GROUP_OVERRIDES[key]) return SEASON_GROUP_OVERRIDES[key];
    return GROUP_BY_KEY[key] || 'Other';
};

export const recordOrder = (recordName, { seasonView = false } = {}) => {
    const key = String(recordName).toLowerCase();
    if (seasonView && key in SEASON_ORDER_OVERRIDES) return SEASON_ORDER_OVERRIDES[key];
    return ORDER_BY_KEY[key] ?? 999;
};

export const SEASON_EXCLUDED_RECORDS = new Set(['largest_lead', 'largest_deficit', 'largest_spread', 'largest_upset']);

export const EXCLUDED_RECORDS = new Set(['ot_score', 'field_goal_percentage', 'normal_kickoff_attempts', 'number_of_kickoffs', 'onside_attempts']);

export const LOWEST_RECORD_STATS = new Set(['average_offensive_diff', 'average_offensive_special_teams_diff', 'average_response_speed']);

export const AMBIGUOUS_DIRECTION_RECORDS = new Set(['average_diff', 'average_defensive_diff', 'average_defensive_special_teams_diff']);

const LABEL_OVERRIDES = { blocked_opponent_punt: 'Blocked Opponent Punts', field_goal_touchdown: 'Kick Six Against' };

export const recordLabel = (recordName) => {
    const key = String(recordName).toLowerCase();
    if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
    return (recordName || '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\bPercentage\b/g, '%')
        .replace(/\bThird\b/g, '3rd')
        .replace(/\bFourth\b/g, '4th')
        .replace(/\bTds\b/g, 'Touchdowns')
        .replace(/\bTd\b/g, 'Touchdown');
};
