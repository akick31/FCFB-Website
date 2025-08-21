import apiClient from './apiClient';

export const getGameById = async (gameId) => {
    try {
        // Use path parameter instead of query parameter to avoid backend parsing issues
        return await apiClient.get(`/game/${gameId}`);
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
        searchParams.append('category', params.category);
        searchParams.append('sort', params.sort);
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