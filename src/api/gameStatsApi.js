import apiClient from './apiClient';

export const getGameStatsForTeam = async (gameId, team) => {
    try {
        return await apiClient.get(`/arceus/game_stats?gameId=${gameId}&team=${team}`);
    } catch (error) {
        console.error("Failed to fetch stats for game:", error);
        throw error; // Rethrow to let the caller handle it
    }
};
