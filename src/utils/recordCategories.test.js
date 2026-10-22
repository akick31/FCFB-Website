import { recordLabel, recordGroup, EXCLUDED_RECORDS, TIME_RECORDS } from './recordCategories';
import { formatTime } from './statsCatalog';

test('record labels spell out what the stat actually counts', () => {
    expect(recordLabel('touchdowns')).toBe('Total Touchdowns');
    expect(recordLabel('pass_successes')).toBe('Successful Passes');
    expect(recordLabel('pass_success_percentage')).toBe('Pass Success Rate');
    expect(recordLabel('red_zone_successes')).toBe('Red Zone Touchdowns');
    expect(recordLabel('points_against')).toBe('Points Allowed');
    expect(recordLabel('average_punt_length')).toBe('Yards per Punt');
});

test('labels without an override keep the generated form', () => {
    expect(recordLabel('pass_yards')).toBe('Pass Yards');
    expect(recordLabel('longest_run')).toBe('Longest Run');
    expect(recordLabel('safeties_forced')).toBe('Safeties Forced');
});

test('yards per attempt records sit in their own passing and rushing groups', () => {
    expect(recordLabel('average_pass_yards_per_attempt')).toBe('Yards per Pass Attempt');
    expect(recordGroup('average_pass_yards_per_attempt')).toBe('Passing');
    expect(recordGroup('average_rush_yards_per_attempt')).toBe('Rushing');
});

test('field goal success rate is shown and named for what it measures', () => {
    expect(EXCLUDED_RECORDS.has('field_goal_percentage')).toBe(false);
    expect(recordLabel('field_goal_percentage')).toBe('Field Goals Made %');
});

test('clock records render as minutes and seconds', () => {
    expect(TIME_RECORDS.has('time_of_possession')).toBe(true);
    expect(TIME_RECORDS.has('average_response_speed')).toBe(true);
    expect(TIME_RECORDS.has('total_yards')).toBe(false);
    expect(formatTime(1845)).toBe('30:45');
    expect(formatTime(95)).toBe('1:35');
});
