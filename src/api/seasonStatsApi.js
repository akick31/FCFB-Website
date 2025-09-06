import apiClient from './apiClient';

// Season Stats API functions - matches SeasonStatsController
export const getFilteredSeasonStats = async (team = null, conference = null, season = null, stat = null, page = 0, size = 20) => {
    try {
        const params = { page, size };
        if (team) params.team = team;
        if (conference) params.conference = conference;
        if (season) params.season = season;
        if (stat) params.stat = stat;
        
        const response = await apiClient.get('/season-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch filtered season stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch filtered season stats');
        }
        throw new Error('An unexpected error occurred while fetching filtered season stats');
    }
};

// Leaderboard function
export const getLeaderboard = async (statName, season, subdivision, conference, limit = 10, ascending = false) => {
    try {
        const params = { statName, limit, ascending };
        if (season) params.season = season;
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
