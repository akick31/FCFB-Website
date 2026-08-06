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

export const startOffseason = async () => {
    try {
        const response = await apiClient.post(`/offseason/start`);
        return response.data;
    } catch (error) {
        console.error("Failed to start offseason:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to start offseason");
        }
        throw new Error("An unexpected error occurred while starting offseason");
    }
};

export const endOffseason = async () => {
    try {
        const response = await apiClient.post(`/offseason/end`);
        return response.data || null;
    } catch (error) {
        console.error("Failed to end offseason:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to end offseason");
        }
        throw new Error("An unexpected error occurred while ending offseason");
    }
};
