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

// /season/current 500s between seasons, so fall back to the most recent entry in /season/all.
const getLatestSeason = async () => {
    const allSeasons = await getAllSeasons();
    return allSeasons.reduce((latest, s) => {
        const num = s.season_number ?? s.seasonNumber;
        const latestNum = latest?.season_number ?? latest?.seasonNumber;
        return latestNum === undefined || num > latestNum ? s : latest;
    }, null);
};

export const getCurrentSeasonOrLatest = async () => {
    try {
        return await getCurrentSeason();
    } catch (error) {
        const latestSeason = await getLatestSeason();
        const seasonNumber = latestSeason?.season_number ?? latestSeason?.seasonNumber;
        if (seasonNumber == null) throw error;
        return seasonNumber;
    }
};

export const getCurrentWeekOrLatest = async () => {
    try {
        return await getCurrentWeek();
    } catch (error) {
        const latestSeason = await getLatestSeason();
        const week = latestSeason?.current_week ?? latestSeason?.currentWeek;
        if (week == null) throw error;
        return week;
    }
};

export const getSeasonByNumber = async (seasonNumber) => {
    try {
        const response = await apiClient.get(`/season/${seasonNumber}`);
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
        const response = await apiClient.get(`/season/${seasonNumber}/schedule-locked`);
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
        const response = await apiClient.put(`/season/${seasonNumber}/lock-schedule`);
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
        const response = await apiClient.put(`/season/${seasonNumber}/unlock-schedule`);
        return response.data;
    } catch (error) {
        console.error("Failed to unlock schedule:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to unlock schedule");
        }
        throw new Error("An unexpected error occurred while unlocking schedule");
    }
};

export const createSeasonForScheduling = async (seasonNumber) => {
    try {
        const response = await apiClient.post(`/season/${seasonNumber}`);
        return response.data;
    } catch (error) {
        console.error("Failed to create season:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to create season");
        }
        throw new Error("An unexpected error occurred while creating season");
    }
};