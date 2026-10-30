import apiClient from './apiClient';

export const getHistoryWeeks = async (season) => {
    const response = await apiClient.get('/history/weeks', { params: { season } });
    return response.data;
};

export const getHistoryWeek = async (season, week) => {
    const response = await apiClient.get('/history/week', { params: { season, week } });
    return response.data;
};
