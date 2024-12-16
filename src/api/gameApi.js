import apiClient from './apiClient';

export const getGameById = async (gameId) => {
    try {
        return await apiClient.get(`/arceus/game/id?id=${gameId}`);
    } catch (error) {
        console.error("Failed to fetch game by id:", error);
        throw error; // Rethrow to let the caller handle it
    }
}

export const getAllOngoingGames = async () => {
    try {
        return await apiClient.get(`/arceus/game/all/ongoing`);
    } catch (error) {
        console.error("Failed to fetch all ongoing games:", error);
        throw error; // Rethrow to let the caller handle it
    }
};

export const getAllPastGames = async () => {
    try {
        return await apiClient.get(`/arceus/game/all/past`);
    } catch (error) {
        console.error("Failed to fetch all past games:", error);
        throw error; // Rethrow to let the caller handle it
    }
};

export const getAllPastScrimmageGames = async () => {
    try {
        return await apiClient.get(`/arceus/game/all/past/scrimmage`);
    } catch (error) {
        console.error("Failed to fetch all past scrimmage games:", error);
        throw error; // Rethrow to let the caller handle it
    }
};

export const getAllScrimmageGames = async () => {
    try {
        return await apiClient.get(`/arceus/game/all/ongoing/scrimmage`);
    } catch (error) {
        console.error("Failed to fetch all ongoing scrimmage games:", error);
        throw error; // Rethrow to let the caller handle it
    }
};