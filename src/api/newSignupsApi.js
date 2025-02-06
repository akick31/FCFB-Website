import apiClient from "./apiClient";

export const getNewSignups = async () => {
    try {
        const response = await apiClient.get('/new_signups');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch new signups:", error);
        throw error;
    }
}