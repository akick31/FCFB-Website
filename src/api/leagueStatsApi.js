import apiClient from './apiClient';

// League Stats API functions
export const getAllLeagueStats = async (subdivision = null, seasonNumber = null) => {
    try {
        const params = {};
        if (subdivision) params.subdivision = subdivision;
        if (seasonNumber) params.seasonNumber = seasonNumber;
        
        const response = await apiClient.get('/league-stats/all', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all league stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch all league stats');
        }
        throw new Error('An unexpected error occurred while fetching all league stats');
    }
};

export const getLeagueStatsBySubdivisionAndSeason = async (subdivision, seasonNumber) => {
    try {
        const params = { subdivision, seasonNumber };
        const response = await apiClient.get('/league-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch league stats by subdivision and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch league stats');
        }
        throw new Error('An unexpected error occurred while fetching league stats');
    }
};

export const getLeagueStatsBySubdivision = async (subdivision) => {
    try {
        const params = { subdivision };
        const response = await apiClient.get('/league-stats/subdivision', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch league stats by subdivision:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch league stats by subdivision');
        }
        throw new Error('An unexpected error occurred while fetching league stats by subdivision');
    }
};

export const getLeagueStatsBySeason = async (seasonNumber) => {
    try {
        const params = { seasonNumber };
        const response = await apiClient.get('/league-stats/season', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch league stats by season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch league stats by season');
        }
        throw new Error('An unexpected error occurred while fetching league stats by season');
    }
};

export const generateAllLeagueStats = async () => {
    try {
        const response = await apiClient.post('/league-stats/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all league stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all league stats');
        }
        throw new Error('An unexpected error occurred while generating all league stats');
    }
};

export const generateLeagueStatsForSubdivisionAndSeason = async (subdivision, seasonNumber) => {
    try {
        const params = { subdivision, seasonNumber };
        const response = await apiClient.post('/league-stats/generate/subdivision-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate league stats for subdivision and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate league stats for subdivision and season');
        }
        throw new Error('An unexpected error occurred while generating league stats for subdivision and season');
    }
};
