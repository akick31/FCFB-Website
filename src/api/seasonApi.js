import apiClient from './apiClient';

export const getCurrentWeek = async () => {
    try {
        const response = await apiClient.get(`/arceus/season/week`)
        return response.data;
    } catch (error) {
        console.error("Failed to fetch current week:", error);
        return 1
    }
};

