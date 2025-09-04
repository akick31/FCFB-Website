import apiClient from './apiClient';

// Season Stats API functions - matches SeasonStatsController
export const getAllSeasonStats = async (filters = {}) => {
    try {
        const params = {};
        if (filters.team) params.team = filters.team;
        if (filters.seasonNumber) params.seasonNumber = filters.seasonNumber;
        if (filters.subdivision) params.subdivision = filters.subdivision;
        
        const response = await apiClient.get('/season-stats/all', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch season stats');
        }
        throw new Error('An unexpected error occurred while fetching season stats');
    }
};

export const getSeasonStatsByTeamAndSeason = async (team, seasonNumber) => {
    try {
        const params = { team, seasonNumber };
        const response = await apiClient.get('/season-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch team season stats');
        }
        throw new Error('An unexpected error occurred while fetching team season stats');
    }
};

export const getSeasonStatsByTeam = async (team) => {
    try {
        const params = { team };
        const response = await apiClient.get('/season-stats/team', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch team season stats');
        }
        throw new Error('An unexpected error occurred while fetching team season stats');
    }
};

export const getSeasonStatsBySeason = async (seasonNumber) => {
    try {
        const params = { seasonNumber };
        const response = await apiClient.get('/season-stats/season', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch season stats');
        }
        throw new Error('An unexpected error occurred while fetching season stats');
    }
};

// Leaderboard function
export const getLeaderboard = async (statName, seasonNumber, subdivision, conference, limit = 10, ascending = false) => {
    try {
        const params = { statName, limit, ascending };
        if (seasonNumber) params.seasonNumber = seasonNumber;
        if (subdivision) params.subdivision = subdivision;
        if (conference) params.conference = conference;
        
        const response = await apiClient.get('/season-stats/leaderboard', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch leaderboard');
        }
        throw new Error('An unexpected error occurred while fetching leaderboard');
    }
};



export const generateAllSeasonStats = async () => {
    try {
        const response = await apiClient.post('/season-stats/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all season stats');
        }
        throw new Error('An unexpected error occurred while generating all season stats');
    }
};

export const generateSeasonStatsForTeam = async (team, seasonNumber) => {
    try {
        const params = { team, seasonNumber };
        const response = await apiClient.post('/season-stats/generate/team-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate team season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate team season stats');
        }
        throw new Error('An unexpected error occurred while generating team season stats');
    }
};
