import apiClient from './apiClient';

export const backendRoot = (apiClient.defaults.baseURL || '').replace(/\/api\/v1\/arceus\/?$/, '');

export const getPublicApiSpec = async () => {
    try {
        const response = await apiClient.get('/api-docs/public');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch public API spec:', error);
        throw new Error('An unexpected error occurred while fetching the API docs');
    }
};

export const getAdminApiSpec = async () => {
    try {
        const response = await apiClient.get('/api-docs/admin');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch admin API spec:', error);
        if (error.response) {
            throw new Error(error.response.data?.error || 'Failed to fetch the admin API docs');
        }
        throw new Error('An unexpected error occurred while fetching the admin API docs');
    }
};
