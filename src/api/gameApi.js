import apiClient from './apiClient';

export const getAllOngoingGames = async () => {
    try {
        return await apiClient.get(`/arceus/game/all`);
    } catch (error) {
        console.error("Failed to fetch all ongoing games:", error);
        throw error; // Rethrow to let the caller handle it
    }
};
