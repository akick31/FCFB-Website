import apiClient from './apiClient';

export const getGameStatsByIdAndTeam = async (gameId, team) => {
    try {
        const encodedTeam = encodeURIComponent(team);
        return await apiClient.get(`/game-stats/by-game?gameId=${gameId}&team=${encodedTeam}`);
    } catch (error) {
        console.error('Failed to fetch stats for game:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch./stats for game');
        }
        throw new Error('An unexpected error occurred while fetching stats for game');
    }
};

export const getGameStatsByTeamAndSeason = async (team, season) => {
    try {
        const params = { team, season };
        const response = await apiClient.get('/game-stats/by-team-season', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch game stats by team and season:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch game stats by team and season');
        }
        throw new Error('An unexpected error occurred while fetching game stats by team and season');
    }
};

export const generateGameStats = async (gameId) => {
    try {
        const response = await apiClient.post(`/game-stats/generate?gameId=${gameId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to generate game stats:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate game stats');
        }
        throw new Error('An unexpected error occurred while generating game stats');
    }
};

export const getGameStatsBySeasonAndWeek = async (season, week = null) => {
    try {
        const params = { season, ...(week && { week }) };
        const response = await apiClient.get('/game-stats/by-season-week', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch game stats by season and week:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch game stats');
        }
        throw new Error('An unexpected error occurred while fetching game stats');
    }
};
