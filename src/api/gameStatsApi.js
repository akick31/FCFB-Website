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