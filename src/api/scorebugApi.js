import apiClient from './apiClient';
import {byteArrayToBase64} from "../utils/image";

export const getFilteredScorebugs = async (params) => {
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

        const response = await apiClient.get('/scorebug/filtered', {
            params: searchParams,
            responseType: 'json',
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch filtered scorebugs:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch filtered scorebugs");
        }
        throw new Error("An unexpected error occurred while fetching filtered scorebugs");
    }
};

export const getLatestScorebugByGameId = async (gameId) => {
    try {
        const response = await apiClient.get(`/scorebug/latest`, {
            params: { gameId },
            responseType: 'blob',
        });

        const arrayBuffer = await response.data.arrayBuffer();
        return byteArrayToBase64(new Uint8Array(arrayBuffer));

    } catch (error) {
        console.error("Failed to fetch game scorebug:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch game scorebug");
        }
        throw new Error("An unexpected error occurred while fetching the game scorebug");
    }
};