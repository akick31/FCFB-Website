import apiClient from './apiClient';
import { startGameWeek, getGameWeekJobStatus, getAllGameWeekJobs, retryFailedGames } from './scheduleApi';

jest.mock('./apiClient', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
    apiClient.get.mockResolvedValue({ data: { jobId: 'job-123' } });
    apiClient.post.mockResolvedValue({ data: { jobId: 'job-123' } });
});

test.each([
    [
        'start',
        () => startGameWeek(12, 15),
        'post',
        ['/start-game-week-job', null, { params: { season: 12, week: 15 } }],
    ],
    [
        'status',
        () => getGameWeekJobStatus('job-123'),
        'get',
        ['/start-game-week-job/status', { params: { jobId: 'job-123' } }],
    ],
    ['list', () => getAllGameWeekJobs(), 'get', ['/start-game-week-job/jobs']],
    [
        'retry',
        () => retryFailedGames('job-123'),
        'post',
        ['/start-game-week-job/retry', null, { params: { jobId: 'job-123' } }],
    ],
])('%s uses the start-game-week job contract', async (_, call, method, args) => {
    await expect(call()).resolves.toEqual({ jobId: 'job-123' });
    expect(apiClient[method]).toHaveBeenCalledWith(...args);
});
