import apiClient from './apiClient';

const failure = (error, fallback) => new Error(error.response?.data?.error || fallback);

export const getTeamUniform = async (team) => {
    try {
        return (await apiClient.get('/team-appearance/uniform', { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to load uniform');
    }
};

export const updateTeamUniform = async (team, body) => {
    try {
        return (await apiClient.put('/team-appearance/uniform', body, { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to save uniform');
    }
};

export const getTeamField = async (team) => {
    try {
        return (await apiClient.get('/team-appearance/field', { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to load field');
    }
};

export const updateTeamField = async (team, body) => {
    try {
        return (await apiClient.put('/team-appearance/field', body, { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to save field');
    }
};

export const renderAppearancePreview = async (request) => {
    try {
        const response = await apiClient.post('/appearance-preview', request, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    } catch (error) {
        throw failure(error, 'Failed to render preview');
    }
};
