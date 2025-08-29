import apiClient from './apiClient';

export const getGameById = async (gameId) => {
    try {
        const response = await apiClient.get(`/game/${gameId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch game by id:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch game by id");
        }
        throw new Error("An unexpected error occurred while fetching game by id");
    }
};

export const getAllOngoingGames = async () => {
    try {
        return await apiClient.get(`/game/all/ongoing`);
    } catch (error) {
        console.error("Failed to fetch all ongoing games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch ongoing games");
        }
        throw new Error("An unexpected error occurred while fetching ongoing games");
    }
};

export const getAllPastGames = async () => {
    try {
        return await apiClient.get(`/game/all/past`);
    } catch (error) {
        console.error("Failed to fetch all past games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch past games");
        }
        throw new Error("An unexpected error occurred while fetching past games");
    }
};

export const getAllPastScrimmageGames = async () => {
    try {
        return await apiClient.get(`/game/all/past/scrimmage`);
    } catch (error) {
        console.error("Failed to fetch all past scrimmage games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch past scrimmage games");
        }
        throw new Error("An unexpected error occurred while fetching past scrimmage games");
    }
};

export const getAllScrimmageGames = async () => {
    try {
        return await apiClient.get(`/game/all/ongoing/scrimmage`);
    } catch (error) {
        console.error("Failed to fetch all ongoing scrimmage games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch ongoing scrimmage games");
        }
        throw new Error("An unexpected error occurred while fetching ongoing scrimmage games");
    }
};

export const getFilteredGames = async (params) => {
    try {
        const searchParams = new URLSearchParams();

        if (params.filters) {
            params.filters.forEach(filter => {
                if (filter !== null && filter !== '') searchParams.append('filters', filter);
            });
        }

        if (params.week) searchParams.append('week', params.week);
        if (params.season) searchParams.append('season', params.season);
        if (params.conference) searchParams.append('conference', params.conference);
        if (params.category) searchParams.append('category', params.category);
        if (params.sort) searchParams.append('sort', params.sort);
        searchParams.append('page', params.page);
        searchParams.append('size', params.size);

        const response = await apiClient.get('/game', {
            params: searchParams,
            responseType: 'json',
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch filtered games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch filtered games");
        }
        throw new Error("An unexpected error occurred while fetching filtered games");
    }
};

// New game management functions
export const startGame = async (startRequest) => {
    try {
        const response = await apiClient.post('/game', startRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to start game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start game");
        }
        throw new Error("An unexpected error occurred while starting game");
    }
};

export const startScrimmage = async (startRequest) => {
    try {
        const response = await apiClient.post('/game', { ...startRequest, gameType: 'SCRIMMAGE' });
        return response.data;
    } catch (error) {
        console.error("Failed to start scrimmage:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start scrimmage");
        }
        throw new Error("An unexpected error occurred while starting scrimmage");
    }
};

export const startOvertimeGame = async (startRequest) => {
    try {
        const response = await apiClient.post('/game/overtime', startRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to start overtime game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start overtime game");
        }
        throw new Error("An unexpected error occurred while starting overtime game");
    }
};

export const markAllGamesAsChewMode = async () => {
    try {
        const response = await apiClient.post('/game/chew-all');
        return response.data;
    } catch (error) {
        console.error("Failed to mark all games as chew mode:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to mark all games as chew mode");
        }
        throw new Error("An unexpected error occurred while marking all games as chew mode");
    }
};

export const endAllOngoingGames = async () => {
    try {
        const response = await apiClient.post('/game/end-all');
        return response.data;
    } catch (error) {
        console.error("Failed to end all ongoing games:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to end all ongoing games");
        }
        throw new Error("An unexpected error occurred while ending all ongoing games");
    }
};

export const updateGame = async (gameId, gameData) => {
    try {
        const response = await apiClient.put(`/game/${gameId}`, gameData);
        return response.data;
    } catch (error) {
        console.error("Failed to update game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update game");
        }
        throw new Error("An unexpected error occurred while updating game");
    }
};

export const restartGame = async (gameId) => {
    try {
        const response = await apiClient.post(`/game/restart?channelId=${gameId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to restart game:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to restart game");
        }
        throw new Error("An unexpected error occurred while restarting game");
    }
};



