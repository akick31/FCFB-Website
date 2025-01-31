import apiClient from './apiClient';
import {byteArrayToBase64} from "../utils/image";

export const getFilteredScorebugs = async (params) => {
    try {
        const searchParams = new URLSearchParams();

        // Add filters multiple times
        if (params.filters) {
            params.filters.forEach(filter => {
                if (filter !== null && filter !== '') searchParams.append('filters', filter);
            });
        }

        // Add other parameters
        if (params.week) searchParams.append('week', params.week);
        if (params.season) searchParams.append('season', params.season);
        if (params.conference) searchParams.append('conference', params.conference);
        searchParams.append('category', params.category);
        searchParams.append('sort', params.sort);
        searchParams.append('page', params.page);
        searchParams.append('size', params.size);

        // Use the URLSearchParams object for params
        const response = await apiClient.get('/arceus/scorebug/filtered', {
            params: searchParams,
            responseType: 'json',
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch filtered scorebugs:", error);
        throw error;
    }
};

export const getLatestScorebugByGameId = async (gameId) => {
    try {
        // Request the scorebug image as a Blob (binary data)
        const response = await apiClient.get(`/arceus/scorebug/latest`, {
            params: { gameId },
            responseType: 'blob', // Set response type to 'blob' to get the binary data
        });

        // Convert the Blob into a byte array (Uint8Array)
        const arrayBuffer = await response.data.arrayBuffer();
        // Return the byte array (or you could return the arrayBuffer if needed)
        return byteArrayToBase64(new Uint8Array(arrayBuffer));

    } catch (error) {
        console.error("Failed to fetch game scorebug:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};
