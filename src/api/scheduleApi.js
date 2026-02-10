import apiClient from './apiClient';

// ===== GET Endpoints =====

export const getScheduleBySeasonAndTeam = async (season, team) => {
    try {
        const response = await apiClient.get('/schedule/season', {
            params: { season, team }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch schedule");
        }
        throw new Error("An unexpected error occurred while fetching schedule");
    }
};

export const getScheduleBySeason = async (season) => {
    try {
        const response = await apiClient.get(`/schedule/season/${season}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch season schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch season schedule");
        }
        throw new Error("An unexpected error occurred while fetching season schedule");
    }
};

export const getScheduleBySeasonAndWeek = async (season, week) => {
    try {
        const response = await apiClient.get(`/schedule/season/${season}/week/${week}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch week schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch week schedule");
        }
        throw new Error("An unexpected error occurred while fetching week schedule");
    }
};

export const getConferenceSchedule = async (season, conference) => {
    try {
        const response = await apiClient.get('/schedule/conference', {
            params: { season, conference }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch conference schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch conference schedule");
        }
        throw new Error("An unexpected error occurred while fetching conference schedule");
    }
};

export const getScheduleById = async (id) => {
    try {
        const response = await apiClient.get(`/schedule/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch schedule entry:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch schedule entry");
        }
        throw new Error("An unexpected error occurred while fetching schedule entry");
    }
};

export const isTeamAvailable = async (season, week, team) => {
    try {
        const response = await apiClient.get('/schedule/team-available', {
            params: { season, week, team }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to check team availability:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to check team availability");
        }
        throw new Error("An unexpected error occurred while checking team availability");
    }
};

// ===== POST Endpoints =====

export const createScheduleEntry = async (entry) => {
    try {
        const response = await apiClient.post('/schedule', entry);
        return response.data;
    } catch (error) {
        console.error("Failed to create schedule entry:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to create schedule entry");
        }
        throw new Error("An unexpected error occurred while creating schedule entry");
    }
};

export const createBulkScheduleEntries = async (entries) => {
    try {
        const response = await apiClient.post('/schedule/bulk', { entries });
        return response.data;
    } catch (error) {
        console.error("Failed to create bulk schedule entries:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to create bulk schedule entries");
        }
        throw new Error("An unexpected error occurred while creating bulk schedule entries");
    }
};

export const generateConferenceSchedule = async (request) => {
    try {
        const response = await apiClient.post('/schedule/generate-conference', request, {
            timeout: 120000, // 2 minutes — backtracking may take time
        });
        return response.data;
    } catch (error) {
        console.error("Failed to generate conference schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to generate conference schedule");
        }
        throw new Error("An unexpected error occurred while generating conference schedule");
    }
};

/**
 * Auto-generate conference schedules for ALL conferences in a season (async fire-and-forget).
 * Returns a job response with a jobId to poll for progress.
 */
export const generateAllConferenceSchedules = async (season) => {
    try {
        const response = await apiClient.post(`/schedule/generate-all-conferences/${season}`);
        return response.data;
    } catch (error) {
        console.error("Failed to start all conference schedule generation:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start schedule generation");
        }
        throw new Error("An unexpected error occurred while starting schedule generation");
    }
};

/**
 * Poll the status of an all-conference generation job.
 */
export const pollScheduleGenJobStatus = async (jobId) => {
    try {
        const response = await apiClient.get(`/schedule/generate-all-conferences/status/${jobId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to poll schedule generation status:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to poll schedule generation status");
        }
        throw new Error("An unexpected error occurred while polling schedule generation status");
    }
};

/**
 * Start a game week (async). Returns a job ID immediately.
 * Use pollGameWeekJobStatus() to track progress.
 */
export const startGameWeek = async (season, week) => {
    try {
        const response = await apiClient.post('/game/week', null, {
            params: { season, week },
        });
        return response.data; // { jobId, message }
    } catch (error) {
        console.error("Failed to start game week:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start game week");
        }
        throw new Error("An unexpected error occurred while starting game week");
    }
};

/**
 * Poll the status of a game week start job.
 */
export const getGameWeekJobStatus = async (jobId) => {
    try {
        const response = await apiClient.get(`/game/week/status/${jobId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch job status:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch job status");
        }
        throw new Error("An unexpected error occurred while fetching job status");
    }
};

/**
 * Get all game week jobs.
 */
export const getAllGameWeekJobs = async () => {
    try {
        const response = await apiClient.get('/game/week/jobs');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch game week jobs:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch game week jobs");
        }
        throw new Error("An unexpected error occurred while fetching game week jobs");
    }
};

/**
 * Retry failed games from a previous job. Returns a new job ID.
 */
export const retryFailedGames = async (jobId) => {
    try {
        const response = await apiClient.post(`/game/week/retry/${jobId}`);
        return response.data; // { jobId, message }
    } catch (error) {
        console.error("Failed to retry failed games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to retry failed games");
        }
        throw new Error("An unexpected error occurred while retrying failed games");
    }
};

export const getPostseasonSchedule = async (season) => {
    try {
        const response = await apiClient.get(`/schedule/postseason/${season}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch postseason schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch postseason schedule");
        }
        throw new Error("An unexpected error occurred while fetching postseason schedule");
    }
};

export const saveConferenceRules = async (conference, numConferenceGames, protectedRivalries) => {
    try {
        const response = await apiClient.post('/schedule/conference-rules', {
            conference,
            numConferenceGames,
            protectedRivalries: protectedRivalries.filter(r => r.team1 && r.team2),
        });
        return response.data;
    } catch (error) {
        console.error("Failed to save conference rules:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to save conference rules");
        }
        throw new Error("An unexpected error occurred while saving conference rules");
    }
};

export const getConferenceRules = async (conference) => {
    try {
        const response = await apiClient.get('/schedule/conference-rules', {
            params: { conference }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch conference rules:", error);
        if (error.response) {
            // 404 is expected if rules don't exist yet
            if (error.response.status === 404) {
                return null;
            }
            throw new Error(error.response.data.error || "Failed to fetch conference rules");
        }
        throw new Error("An unexpected error occurred while fetching conference rules");
    }
};

// ===== PUT Endpoints =====

export const updateScheduleEntry = async (id, entry) => {
    try {
        const response = await apiClient.put(`/schedule/${id}`, entry);
        return response.data;
    } catch (error) {
        console.error("Failed to update schedule entry:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update schedule entry");
        }
        throw new Error("An unexpected error occurred while updating schedule entry");
    }
};

export const moveGame = async (scheduleId, newWeek) => {
    try {
        const response = await apiClient.put('/schedule/move', { scheduleId, newWeek });
        return response.data;
    } catch (error) {
        console.error("Failed to move game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to move game");
        }
        throw new Error("An unexpected error occurred while moving game");
    }
};

// ===== DELETE Endpoints =====

export const deleteScheduleEntry = async (id) => {
    try {
        await apiClient.delete(`/schedule/${id}`);
        return true;
    } catch (error) {
        console.error("Failed to delete schedule entry:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to delete schedule entry");
        }
        throw new Error("An unexpected error occurred while deleting schedule entry");
    }
};

export const deleteScheduleBySeason = async (season) => {
    try {
        await apiClient.delete(`/schedule/season/${season}`);
        return true;
    } catch (error) {
        console.error("Failed to delete season schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to delete season schedule");
        }
        throw new Error("An unexpected error occurred while deleting season schedule");
    }
};
