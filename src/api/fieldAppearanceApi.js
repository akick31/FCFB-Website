import apiClient from './apiClient';

const fetchData = async (path, params, failure) => {
    try {
        const response = await apiClient.get(path, { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || failure);
    }
};

const saveData = async (path, params, body, failure) => {
    try {
        const response = await apiClient.put(path, body, { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || failure);
    }
};

export const getBowlFields = () => fetchData('/bowl-field/all', undefined, 'Failed to load bowl fields');

export const getBowlField = (bowl) => fetchData('/bowl-field', { bowl }, 'Failed to load bowl field');

export const updateBowlField = (bowl, body) => saveData('/bowl-field', { bowl }, body, 'Failed to save bowl field');

export const getPlayoffFields = () => fetchData('/postseason-field/playoff/all', undefined, 'Failed to load playoff fields');

export const updatePlayoffField = (round, body) => saveData('/postseason-field/playoff', { round }, body, 'Failed to save playoff field');

export const getConferenceChampionshipField = (conference) =>
    fetchData('/postseason-field/conference-championship', { conference }, 'Failed to load conference championship field');

export const updateConferenceChampionshipField = (conference, body) =>
    saveData('/postseason-field/conference-championship', { conference }, body, 'Failed to save conference championship field');

export const renderPostseasonPreview = async (request) => {
    try {
        const response = await apiClient.post('/appearance-preview/postseason', request, { responseType: 'blob' });
        return URL.createObjectURL(response.data);
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to render preview');
    }
};
