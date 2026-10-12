import apiClient from './apiClient';
import {
    startGame,
    startScrimmage,
    startOvertimeGame,
    restartGame,
    endGameByGameId,
    endAllOngoingGames,
} from './gameApi';

jest.mock('./apiClient', () => ({ post: jest.fn() }));

const request = { homeTeam: 'Texas', awayTeam: 'Oklahoma', gameType: 'CONFERENCE_GAME' };
const operations = [
    [() => startGame(request), ['/game-creation', request]],
    [() => startScrimmage(request), ['/game-creation', { ...request, gameType: 'SCRIMMAGE' }]],
    [() => startOvertimeGame(request), ['/game-creation/overtime', request]],
    [() => restartGame(123), ['/game-creation/restart?channelId=123']],
    [() => endGameByGameId(7), ['/game-finalization', null, { params: { gameId: 7 } }]],
    [() => endAllOngoingGames(), ['/game-finalization/all']],
];

beforeEach(() => jest.clearAllMocks());

test.each(operations)('lifecycle helper preserves payload and response on its new route', async (call, args) => {
    const game = { game_id: 7, home_team: 'Texas', away_team: 'Oklahoma' };
    const body = args[0].endsWith('/all') ? [game] : game;
    apiClient.post.mockResolvedValue({ data: body });
    await expect(call()).resolves.toBe(body);
    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith(...args);
});

test.each(operations)('lifecycle helper retains the backend error', async (call) => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.post.mockRejectedValue({ response: { data: { error: 'Game could not be saved' } } });
    try {
        await expect(call()).rejects.toThrow('Game could not be saved');
    } finally {
        log.mockRestore();
    }
});
