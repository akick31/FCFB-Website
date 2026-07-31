import apiClient from './apiClient';

export const getConferences = async () => {
    try {
        const response = await apiClient.get('/conference');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conferences:', error);
        return [];
    }
};

export const createConference = async (conference) => {
    const response = await apiClient.post('/conference', conference);
    return response.data;
};

export const updateConference = async (code, conference) => {
    const response = await apiClient.put(`/conference/${encodeURIComponent(code)}`, conference);
    return response.data;
};

export const setConferenceActive = async (code, active) => {
    const response = await apiClient.put(`/conference/${encodeURIComponent(code)}/active`, null, { params: { active } });
    return response.data;
};
