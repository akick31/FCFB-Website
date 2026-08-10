import apiClient from './apiClient';

export const getWriteupScenarios = async () => {
    try {
        const response = await apiClient.get('/game_writeup/scenarios');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch writeup scenarios:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch writeup scenarios");
        }
        throw new Error("An unexpected error occurred while fetching writeup scenarios");
    }
};
