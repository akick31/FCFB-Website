import apiClient from './apiClient';

// Conference Stats API functions
export const getAllConferenceStats = async (subdivision = null, conference = null, seasonNumber = null) => {
    try {
        const params = {};
        if (subdivision) params.subdivision = subdivision;
        if (conference) params.conference = conference;
        if (seasonNumber) params.seasonNumber = seasonNumber;
        
        const response = await apiClient.get('/conference-stats/all', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all conference stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch all conference stats');
        }
        throw new Error('An unexpected error occurred while fetching all conference stats');
    }
};

export const getConferenceStatsBySubdivisionAndConferenceAndSeason = async (subdivision, conference, seasonNumber) => {
    try {
        const params = { subdivision, conference, seasonNumber };
        const response = await apiClient.get('/conference-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conference stats by subdivision, conference, and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch conference stats');
        }
        throw new Error('An unexpected error occurred while fetching conference stats');
    }
};

export const getConferenceStatsBySubdivision = async (subdivision) => {
    try {
        const params = { subdivision };
        const response = await apiClient.get('/conference-stats/subdivision', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conference stats by subdivision:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch conference stats by subdivision');
        }
        throw new Error('An unexpected error occurred while fetching conference stats by subdivision');
    }
};

export const getConferenceStatsByConference = async (conference) => {
    try {
        const params = { conference };
        const response = await apiClient.get('/conference-stats/conference', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conference stats by conference:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch conference stats by conference');
        }
        throw new Error('An unexpected error occurred while fetching conference stats by conference');
    }
};

export const getConferenceStatsBySeason = async (seasonNumber) => {
    try {
        const params = { seasonNumber };
        const response = await apiClient.get('/conference-stats/season', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch conference stats by season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch conference stats by season');
        }
        throw new Error('An unexpected error occurred while fetching conference stats by season');
    }
};

export const generateAllConferenceStats = async () => {
    try {
        const response = await apiClient.post('/conference-stats/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all conference stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all conference stats');
        }
        throw new Error('An unexpected error occurred while generating all conference stats');
    }
};

export const generateConferenceStatsForSubdivisionAndSeason = async (subdivision, seasonNumber) => {
    try {
        const params = { subdivision, seasonNumber };
        const response = await apiClient.post('/conference-stats/generate/subdivision-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate conference stats for subdivision and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate conference stats for subdivision and season');
        }
        throw new Error('An unexpected error occurred while generating conference stats for subdivision and season');
    }
};

export const generateConferenceStatsForSubdivisionAndConferenceAndSeason = async (subdivision, conference, seasonNumber) => {
    try {
        const params = { subdivision, conference, seasonNumber };
        const response = await apiClient.post('/conference-stats/generate/subdivision-conference-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate conference stats for subdivision, conference, and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate conference stats for subdivision, conference, and season');
        }
        throw new Error('An unexpected error occurred while generating conference stats for subdivision, conference, and season');
    }
};
