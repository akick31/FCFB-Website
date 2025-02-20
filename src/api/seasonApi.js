import apiClient from './apiClient';

export const getCurrentWeek = async () => {
    try {
        const response = await apiClient.get(`/season/week`);
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