import { averageFromTotals } from './statAggregation';
import { aggregateSeasonStats } from './aggregateStats';
import { aggregateAllTimeStats, aggregateStatRows, aggregateStatRowsByKey } from './statsCatalog';

const rows = [
    {
        team: 'Home', season_number: 11, offensive_play_yards: 60, offensive_play_count: 10,
        average_yards_per_play: 6, total_yards: 60, punt_yards: 40, punt_count: 1, punts_attempted: 2,
        opponent_offensive_play_yards: -10, opponent_offensive_play_count: 2, opponent_punt_yards: 40, opponent_punt_count: 1,
    },
    {
        team: 'Home', season_number: 12, offensive_play_yards: 360, offensive_play_count: 90,
        average_yards_per_play: 4, total_yards: 360, punt_yards: 180, punt_count: 3, punts_attempted: 3,
        opponent_offensive_play_yards: 10, opponent_offensive_play_count: 8, opponent_punt_yards: 0, opponent_punt_count: 0,
    },
];

const fields = {
    average_yards_per_play: { agg: 'ratio', num: 'offensive_play_yards', den: 'offensive_play_count' },
    average_punt_length: { agg: 'ratio', num: 'punt_yards', den: 'punt_count' },
};

test('YPP weights actual plays rather than game averages', () => {
    expect(averageFromTotals(rows, 'offensive_play_yards', 'offensive_play_count')).toBe(4.2);
});

test('zero-yard and negative-yard samples retain their play counts', () => {
    const samples = [
        { yards: 0, plays: 10 },
        { yards: -20, plays: 10 },
        { yards: 60, plays: 20 },
    ];
    expect(averageFromTotals(samples, 'yards', 'plays')).toBe(1);
    expect(averageFromTotals(samples.slice(0, 2), 'yards', 'plays')).toBe(-1);
});

test('averages with no eligible samples are unavailable', () => {
    expect(averageFromTotals([], 'yards', 'plays')).toBeNull();
    expect(averageFromTotals([{ yards: 0, plays: 0 }], 'yards', 'plays')).toBeNull();
});

test('team aggregation uses eligible punt counts and opponent totals', () => {
    const result = aggregateSeasonStats(rows);
    expect(result.average_yards_per_play).toBe(4.2);
    expect(result.average_punt_length).toBe(55);
    expect(result.opponent_average_yards_per_play).toBe(0);
    expect(result.opponent_average_punt_length).toBe(40);
    expect(result.offensive_play_count).toBe(100);
    expect(result.punt_count).toBe(4);
});

test('league and conference aggregation preserve totals for subsequent aggregation', () => {
    const partials = rows.map((row) => aggregateStatRows([row], fields));
    const result = aggregateStatRows(partials, fields);
    expect(result.average_yards_per_play).toBe(4.2);
    expect(result.average_punt_length).toBe(55);
    expect(result.offensive_play_count).toBe(100);
    expect(aggregateStatRowsByKey(rows, 'team', fields)[0].average_yards_per_play).toBe(4.2);
});

test('all-time leaderboards aggregate exact offensive and opponent samples', () => {
    const [result] = aggregateAllTimeStats(rows);
    expect(result.average_yards_per_play).toBe(4.2);
    expect(result.average_punt_length).toBe(55);
    expect(result.opponent_average_yards_per_play).toBe(0);
    expect(result.offensive_play_count).toBe(100);
});
