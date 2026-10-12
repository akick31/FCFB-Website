import apiClient from './apiClient';
import { getLeaderboard } from './seasonStatsApi';

jest.mock('./apiClient', () => ({ get: jest.fn() }));

beforeEach(() => {
    jest.clearAllMocks();
    apiClient.get.mockResolvedValue({ data: [] });
});

test('leaderboard sends the backend seasonNumber parameter and preserves its result', async () => {
    const rows = [{ team: 'Wyoming', season: 12, wins: 8 }];
    apiClient.get.mockResolvedValue({ data: rows });

    await expect(getLeaderboard('wins', 12, 'FBS', 'MOUNTAIN_WEST', 5, true)).resolves.toEqual(rows);
    expect(apiClient.get).toHaveBeenCalledWith('/season-stats/leaderboard', {
        params: {
            statName: 'wins',
            seasonNumber: 12,
            subdivision: 'FBS',
            conference: 'MOUNTAIN_WEST',
            limit: 5,
            ascending: true,
        },
    });
});

test('leaderboard omits optional filters when not supplied', async () => {
    await expect(getLeaderboard('wins')).resolves.toEqual([]);
    expect(apiClient.get).toHaveBeenCalledWith('/season-stats/leaderboard', {
        params: { statName: 'wins', limit: 10, ascending: false },
    });
});
