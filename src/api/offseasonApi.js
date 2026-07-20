import apiClient from './apiClient';

export const getCurrentOffseason = async () => {
    try {
        const response = await apiClient.get(`/offseason`);
        return response.data || null;
    } catch (error) {
        console.error("Failed to fetch current offseason:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch current offseason");
        }
        throw new Error("An unexpected error occurred while fetching current offseason");
    }
};
