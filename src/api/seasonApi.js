import apiClient from './apiClient';

export const getCurrentWeek = async () => {
    try {
        const response = await apiClient.get(`/season/current/week`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current week:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch current week");
        }
        throw new Error("An unexpected error occurred while fetching current week");
    }
};

export const getCurrentSeason = async () => {
    try {
        const response = await apiClient.get(`/season/current`);
        return response.data["season_number"];
    } catch (error) {
        console.error("Failed to fetch current season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch current season");
        }
        throw new Error("An unexpected error occurred while fetching current season");
    }
};

export const getAllSeasons = async () => {
    try {
        const response = await apiClient.get(`/season/all`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all seasons:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch all seasons");
        }
        throw new Error("An unexpected error occurred while fetching all seasons");
    }
};

export const getCurrentSeasonOrLatest = async () => {
    try {
        return await getCurrentSeason();
    } catch (error) {
        const latestCompleted = await getLatestCompletedSeason();
        const seasonNumber = latestCompleted?.season_number ?? latestCompleted?.seasonNumber;
        if (seasonNumber == null) throw error;
        return seasonNumber;
    }
};

export const getCurrentWeekOrLatest = async () => {
    try {
        return await getCurrentWeek();
    } catch (error) {
        const latestCompleted = await getLatestCompletedSeason();
        const week = latestCompleted?.current_week ?? latestCompleted?.currentWeek;
        if (week == null) throw error;
        return week;
    }
};

export const getCurrentSeasonOrUpcoming = async () => {
    try {
        return await getCurrentSeason();
    } catch (error) {
        const upcoming = await getUpcomingSeason();
        const seasonNumber = upcoming?.season_number ?? upcoming?.seasonNumber;
        if (seasonNumber == null) throw error;
        return seasonNumber;
    }
};

export const getUpcomingSeason = async () => {
    try {
        const response = await apiClient.get(`/season/upcoming`);
        return response.data || null;
    } catch (error) {
        console.error("Failed to fetch upcoming season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch upcoming season");
        }
        throw new Error("An unexpected error occurred while fetching upcoming season");
    }
};

export const getLatestCompletedSeason = async () => {
    try {
        const response = await apiClient.get(`/season/latest-completed`);
        return response.data || null;
    } catch (error) {
        console.error("Failed to fetch latest completed season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch latest completed season");
        }
        throw new Error("An unexpected error occurred while fetching latest completed season");
    }
};

export const getSeasonByNumber = async (seasonNumber) => {
    try {
        const response = await apiClient.get('/season', { params: { seasonNumber } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch season");
        }
        throw new Error("An unexpected error occurred while fetching season");
    }
};

export const isScheduleLocked = async (seasonNumber) => {
    try {
        const response = await apiClient.get('/season/schedule-locked', { params: { seasonNumber } });
        return response.data;
    } catch (error) {
        console.error("Failed to check schedule lock:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to check schedule lock");
        }
        throw new Error("An unexpected error occurred while checking schedule lock");
    }
};

export const lockSchedule = async (seasonNumber) => {
    try {
        const response = await apiClient.put('/season/lock-schedule', null, { params: { seasonNumber } });
        return response.data;
    } catch (error) {
        console.error("Failed to lock schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to lock schedule");
        }
        throw new Error("An unexpected error occurred while locking schedule");
    }
};

export const unlockSchedule = async (seasonNumber) => {
    try {
        const response = await apiClient.put('/season/unlock-schedule', null, { params: { seasonNumber } });
        return response.data;
    } catch (error) {
        console.error("Failed to unlock schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to unlock schedule");
        }
        throw new Error("An unexpected error occurred while unlocking schedule");
    }
};

export const startSeason = async () => {
    try {
        const response = await apiClient.post('/season');
        return response.data;
    } catch (error) {
        console.error("Failed to start season:", error);
        if (error.response) {
            const startError = new Error(error.response.data.error || "Failed to start season");
            startError.status = error.response.status;
            throw startError;
        }
        throw new Error("An unexpected error occurred while starting season");
    }
};

export const endSeason = async () => {
    try {
        const response = await apiClient.post('/season/end');
        return response.data;
    } catch (error) {
        console.error("Failed to end season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to end season");
        }
        throw new Error("An unexpected error occurred while ending season");
    }
};

export const setCurrentSeason = async (seasonNumber) => {
    try {
        const response = await apiClient.put('/season/set-current', null, { params: { seasonNumber } });
        return response.data;
    } catch (error) {
        console.error("Failed to set current season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to set current season");
        }
        throw new Error("An unexpected error occurred while setting current season");
    }
};

export const updateCurrentWeek = async (seasonNumber, week) => {
    try {
        const response = await apiClient.put('/season/week', null, { params: { seasonNumber, week } });
        return response.data;
    } catch (error) {
        console.error("Failed to update current week:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update current week");
        }
        throw new Error("An unexpected error occurred while updating current week");
    }
};

export const createSeasonForScheduling = async (seasonNumber) => {
    try {
        const response = await apiClient.post('/season', null, { params: { seasonNumber } });
        return response.data;
    } catch (error) {
        console.error("Failed to create season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to create season");
        }
        throw new Error("An unexpected error occurred while creating season");
    }
};