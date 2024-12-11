import apiClient from './apiClient';

export const getAllPlaysForGame = async (gameId) => {
    try {
        return await apiClient.get(`/arceus/play/all`, {
            params: {gameId},
        });
    } catch (error) {
        console.error("Failed to fetch plays for game:", error);
        throw error; // Rethrow to let the caller handle it
    }
};
