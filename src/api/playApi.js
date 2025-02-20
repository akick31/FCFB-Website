import apiClient from './apiClient';

export const getAllPlaysForGame = async (gameId) => {
    try {
        return await apiClient.get(`/play/all`, {
            params: {gameId},
        });
    } catch (error) {
        console.error("Failed to fetch plays for game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch plays for game");
        }
        throw new Error("An unexpected error occurred while fetching plays for game");
    }
};