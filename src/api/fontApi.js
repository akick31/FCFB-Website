import apiClient from './apiClient';

export const getFonts = async () => {
    return (await apiClient.get('/font')).data;
};

export const addFont = async (label, url, acknowledged) => {
    try {
        return (await apiClient.post('/font', { label, url, acknowledged })).data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to add font');
    }
};

export const deleteFont = async (name) => {
    try {
        await apiClient.delete('/font', { params: { name } });
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to remove font');
    }
};
