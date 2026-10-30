import apiClient from './apiClient';

export const getPlayAnimation = async (playId) => {
    const response = await apiClient.get('/play-animation', { params: { playId }, responseType: 'blob' });
    return response.data;
};
