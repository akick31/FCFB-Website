import apiClient from './apiClient';

export const getGameStatsByIdAndTeam = async (gameId, team) => {
    try {
        const encodedTeam = encodeURIComponent(team);
        return await apiClient.get(`/game_stats?gameId=${gameId}&team=${encodedTeam}`);
    } catch (error) {
        console.error("Failed to fetch stats for game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch stats for game");
        }
        throw new Error("An unexpected error occurred while fetching stats for game");
    }
};

export const generateGameStats = async (gameId) => {
    try {
        const response = await apiClient.post(`/game_stats/generate?gameId=${gameId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to generate game stats:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to generate game stats");
        }
        throw new Error("An unexpected error occurred while generating game stats");
    }
};

export const generateAllGameStats = async () => {
    try {
        const response = await apiClient.post('/game_stats/generate/all');
        return response.data;
    } catch (error) {
        console.error("Failed to generate all game stats:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to generate all game stats");
        }
        throw new Error("An unexpected error occurred while generating all game stats");
    }
};