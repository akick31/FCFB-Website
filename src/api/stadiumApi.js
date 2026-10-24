import apiClient from './apiClient';

const failure = (error, fallback) => new Error(error.response?.data?.error || fallback);

export const getStadiums = async (includeInactive = false) => {
    try {
        const response = await apiClient.get('/stadium/all', { params: { includeInactive } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load stadiums');
    }
};

export const getStadium = async (name) => {
    try {
        const response = await apiClient.get('/stadium', { params: { name } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load stadium');
    }
};

export const createStadium = async (body) => {
    try {
        const response = await apiClient.post('/stadium', body);
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to create stadium');
    }
};

export const updateStadium = async (name, body) => {
    try {
        const response = await apiClient.put('/stadium', body, { params: { name } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to save stadium');
    }
};

export const setStadiumActive = async (name, active) => {
    try {
        const response = await apiClient.put('/stadium/active', null, { params: { name, active } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to update stadium');
    }
};

export const assignTeamStadium = async (body) => {
    try {
        const response = await apiClient.put('/stadium/team', body);
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to change the team stadium');
    }
};

export const assignGameStadium = async (body) => {
    try {
        const response = await apiClient.put('/stadium/game', body);
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to change the game stadium');
    }
};

export const assignEventStadium = async (body) => {
    try {
        const response = await apiClient.put('/stadium/event', body);
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to change the event stadium');
    }
};

export const renderStadiumPreview = async (body) => {
    try {
        const response = await apiClient.post('/appearance-preview/stadium', body, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    } catch (error) {
        throw failure(error, 'Failed to render the stadium preview');
    }
};
