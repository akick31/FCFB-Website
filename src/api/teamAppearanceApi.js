import apiClient from './apiClient';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1/arceus';

/** A cacheable GET URL for a team's saved-appearance thumbnail, for use directly as an <img> src. */
export const getTeamAppearanceThumbUrl = (team, view) =>
    `${baseURL}/appearance-preview/thumb?team=${encodeURIComponent(team)}&view=${encodeURIComponent(view)}`;

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

export const getConferenceLogoColors = async (team) => {
    try {
        return (await apiClient.get('/team-appearance/conference-logo-colors', { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to load conference logo colors');
    }
};

export const getTeamColors = async (team) => {
    try {
        return (await apiClient.get('/team-appearance/colors', { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to load team colors');
    }
};

export const updateTeamColors = async (team, body) => {
    try {
        return (await apiClient.put('/team-appearance/colors', body, { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to save team colors');
    }
};

export const getTeamLogos = async (team) => {
    try {
        return (await apiClient.get('/team-appearance/logos', { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to load team logos');
    }
};

export const updateTeamLogos = async (team, body) => {
    try {
        return (await apiClient.put('/team-appearance/logos', body, { params: { team } })).data;
    } catch (error) {
        throw failure(error, 'Failed to save team logos');
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
