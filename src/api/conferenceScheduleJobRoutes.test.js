import apiClient from './apiClient';
import { generateAllConferenceSchedules, pollScheduleGenJobStatus } from './scheduleApi';

jest.mock('./apiClient', () => ({ get: jest.fn(), post: jest.fn() }));

beforeEach(() => {
    jest.clearAllMocks();
});

test('conference generation starts a job with the existing response', async () => {
    const response = { jobId: 'conference-job', message: 'Started generating schedules' };
    apiClient.post.mockResolvedValue({ data: response });

    await expect(generateAllConferenceSchedules(12)).resolves.toEqual(response);
    expect(apiClient.post).toHaveBeenCalledWith('/conference-schedule-generation-job', null, {
        params: { season: 12 },
    });
});

test('conference job polling preserves failed status and progress counts', async () => {
    const response = {
        jobId: 'conference-job',
        status: 'FAILED',
        totalConferences: 2,
        completedConferences: 1,
        failedConferences: 0,
        totalGamesGenerated: 9,
        logs: [],
    };
    apiClient.get.mockResolvedValue({ data: response });

    await expect(pollScheduleGenJobStatus('conference-job')).resolves.toEqual(response);
    expect(apiClient.get).toHaveBeenCalledWith('/conference-schedule-generation-job/status', {
        params: { jobId: 'conference-job' },
    });
});
