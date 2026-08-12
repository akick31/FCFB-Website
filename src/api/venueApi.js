import apiClient from './apiClient';

export const getAllVenues = async () => {
    try {
        const response = await apiClient.get('/venue/all');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch venues:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch venues');
        }
        throw new Error('An unexpected error occurred while fetching venues');
    }
};

export const deleteVenue = async (name) => {
    try {
        await apiClient.delete(`/venue/${encodeURIComponent(name)}`);
    } catch (error) {
        console.error('Failed to delete venue:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to delete venue');
        }
        throw new Error('An unexpected error occurred while deleting venue');
    }
};
