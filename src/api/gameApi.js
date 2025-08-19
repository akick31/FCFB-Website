import apiClient from './apiClient';

export const getGameById = async (gameId) => {
    try {
        return await apiClient.get(`/games/${gameId}`);
    } catch (error) {
        console.error("Failed to fetch game by id:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch game by id");
        }
        throw new Error("An unexpected error occurred while fetching game by id");
    }
};

export const getFilteredGames = async (filters, category, sort = "CLOSEST_TO_END", conference, season, week, pageable) => {
    try {
        const params = {
            filters,
            category,
            sort,
            conference,
            season,
            week,
            ...pageable,
        };
        return await apiClient.get(`/games`, { params });
    } catch (error) {
        console.error("Failed to fetch filtered games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch filtered games");
        }
        throw new Error("An unexpected error occurred while fetching filtered games");
    }
};

export const startGame = async (startRequest) => {
    try {
        return await apiClient.post(`/games`, startRequest);
    } catch (error) {
        console.error("Failed to start game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start game");
        }
        throw new Error("An unexpected error occurred while starting the game");
    }
};

export const startOvertimeGame = async (startRequest) => {
    try {
        return await apiClient.post(`/games/overtime`, startRequest);
    } catch (error) {
        console.error("Failed to start overtime game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start overtime game");
        }
        throw new Error("An unexpected error occurred while starting the overtime game");
    }
};

export const startWeek = async (season, week) => {
    try {
        return await apiClient.post(`/games/week`, { season, week });
    } catch (error) {
        console.error("Failed to start week games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start week games");
        }
        throw new Error("An unexpected error occurred while starting week games");
    }
};

export const endGame = async (channelId) => {
    try {
        return await apiClient.post(`/games/${channelId}/end`);
    } catch (error) {
        console.error("Failed to end game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to end game");
        }
        throw new Error("An unexpected error occurred while ending the game");
    }
};

export const endAllGames = async () => {
    try {
        return await apiClient.post(`/games/end-all`);
    } catch (error) {
        console.error("Failed to end all games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to end all games");
        }
        throw new Error("An unexpected error occurred while ending all games");
    }
};

export const chewGame = async (channelId) => {
    try {
        return await apiClient.post(`/games/${channelId}/chew`);
    } catch (error) {
        console.error("Failed to chew game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to chew game");
        }
        throw new Error("An unexpected error occurred while chewing the game");
    }
};

export const restartGame = async (channelId) => {
    try {
        return await apiClient.post(`/games/${channelId}/restart`);
    } catch (error) {
        console.error("Failed to restart game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to restart game");
        }
        throw new Error("An unexpected error occurred while restarting the game");
    }
};

export const markCloseGamePinged = async (gameId) => {
    try {
        return await apiClient.put(`/games/${gameId}/close-game-pinged`);
    } catch (error) {
        console.error("Failed to mark close game pinged:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to mark close game pinged");
        }
        throw new Error("An unexpected error occurred while marking close game pinged");
    }
};

export const markUpsetAlertPinged = async (gameId) => {
    try {
        return await apiClient.put(`/games/${gameId}/upset-alert-pinged`);
    } catch (error) {
        console.error("Failed to mark upset alert pinged:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to mark upset alert pinged");
        }
        throw new Error("An unexpected error occurred while marking upset alert pinged");
    }
};

export const deleteOngoingGame = async (channelId) => {
    try {
        return await apiClient.delete(`/games/${channelId}`);
    } catch (error) {
        console.error("Failed to delete ongoing game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to delete ongoing game");
        }
        throw new Error("An unexpected error occurred while deleting the ongoing game");
    }
};