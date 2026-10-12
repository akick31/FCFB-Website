import apiClient from './apiClient';
import { getGameStatsByIdAndTeam, getGameStatsByTeamAndSeason } from './gameStatsApi';

jest.mock('./apiClient', () => ({ get: jest.fn() }));

beforeEach(() => {
    jest.clearAllMocks();
});

test('game stats use the typed game route and retain the Axios response for callers', async () => {
    const response = { data: { game_id: 123, team: 'San Jose State' }, status: 200 };
    apiClient.get.mockResolvedValue(response);

    await expect(getGameStatsByIdAndTeam(123, 'San Jose State')).resolves.toBe(response);
    expect(apiClient.get).toHaveBeenCalledWith('/game-stats/by-game?gameId=123&team=San%20Jose%20State');
});

test.each([
    [
        [
            { game_id: 123, team: 'San Jose State' },
            { game_id: 456, team: 'San Jose State' },
        ],
    ],
    [[]],
])('season stats use the typed season route and preserve list or empty results', async (rows) => {
    apiClient.get.mockResolvedValue({ data: rows });

    await expect(getGameStatsByTeamAndSeason('San Jose State', 12)).resolves.toBe(rows);
    expect(apiClient.get).toHaveBeenCalledWith('/game-stats/by-team-season', {
        params: { team: 'San Jose State', season: 12 },
    });
});

test.each([[() => getGameStatsByIdAndTeam(123, 'Texas')], [() => getGameStatsByTeamAndSeason('Texas', 12)]])(
    'read helpers retain backend error messages',
    async (readStats) => {
        const log = jest.spyOn(console, 'error').mockImplementation(() => {});
        apiClient.get.mockRejectedValue({ response: { data: { error: 'Stats unavailable' } } });
        try {
            await expect(readStats()).rejects.toThrow('Stats unavailable');
        } finally {
            log.mockRestore();
        }
    }
);
