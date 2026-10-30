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

export const getStadiumById = async (id) => {
    try {
        const response = await apiClient.get('/stadium/by-id', { params: { id } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load stadium');
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

export const getStadiumHistory = async (name) => {
    try {
        const response = await apiClient.get('/stadium/history', { params: { name } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load stadium history');
    }
};

export const revertStadiumChange = async (id) => {
    try {
        const response = await apiClient.put('/stadium/history/revert', null, { params: { id } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to revert the stadium');
    }
};

export const getStadiumGames = async (name) => {
    try {
        const response = await apiClient.get('/stadium/games', { params: { name } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load games at this stadium');
    }
};

export const getUpcomingStadiumGames = async (name) => {
    try {
        const response = await apiClient.get('/stadium/upcoming', { params: { name } });
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load upcoming games');
    }
};

export const getCountries = async () => {
    try {
        const response = await apiClient.get('/stadium/countries');
        return response.data;
    } catch (error) {
        throw failure(error, 'Failed to load countries');
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
