import apiClient from './apiClient';

export const getAllPlaysByGameId = async (gameId) => {
    try {
        const response = await apiClient.get('/play/all', {
            params: { gameId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch plays for game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch plays for game");
        }
        throw new Error("An unexpected error occurred while fetching plays for game");
    }
};

export const getCurrentPlay = async (gameId) => {
    try {
        const response = await apiClient.get('/play/current', {
            params: { gameId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current play:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch current play");
        }
        throw new Error("An unexpected error occurred while fetching current play");
    }
};

export const getPreviousPlay = async (gameId) => {
    try {
        const response = await apiClient.get('/play/previous', {
            params: { gameId }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch previous play:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch previous play");
        }
        throw new Error("An unexpected error occurred while fetching previous play");
    }
};

export const rollbackPlay = async (gameId) => {
    try {
        const response = await apiClient.put(`/play/rollback?gameId=${gameId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to rollback play:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to rollback play");
        }
        throw new Error("An unexpected error occurred while rolling back play");
    }
};