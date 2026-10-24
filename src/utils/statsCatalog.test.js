import { STAT_BY_KEY, withDerivedStats, aggregateAllTimeStats } from './statsCatalog';

test('time of possession splits into a season total and a per game average', () => {
    const [row] = withDerivedStats([{ team: 'A', wins: 3, losses: 1, time_of_possession: 7200 }]);

    expect(row.games_played).toBe(4);
    expect(row.average_time_of_possession).toBe(1800);
    expect(STAT_BY_KEY.average_time_of_possession.format(1800)).toBe('30:00');
    expect(STAT_BY_KEY.time_of_possession.label).toBe('Total time of possession');
});

test('the average is a rate stat and neither one is a pace stat', () => {
    expect(STAT_BY_KEY.average_time_of_possession.rateBased).toBe(true);
    expect(STAT_BY_KEY.average_time_of_possession.pace).toBe(false);
    expect(STAT_BY_KEY.time_of_possession.rateBased).toBe(false);
    expect(STAT_BY_KEY.time_of_possession.pace).toBe(false);
    expect(STAT_BY_KEY.number_of_drives.pace).toBe(false);
    expect(STAT_BY_KEY.average_offensive_diff.pace).toBe(true);
});

test('all time rows average possession over every game played', () => {
    const rows = [
        { team: 'A', season_number: 11, wins: 8, losses: 4, time_of_possession: 21600 },
        { team: 'A', season_number: 12, wins: 3, losses: 1, time_of_possession: 7200 },
    ];

    const [row] = withDerivedStats(aggregateAllTimeStats(rows));

    expect(row.games_played).toBe(16);
    expect(row.time_of_possession).toBe(28800);
    expect(row.average_time_of_possession).toBe(1800);
});
