import apiClient from './apiClient';

// Playbook Stats API functions
export const getAllPlaybookStats = async (offensivePlaybook = null, defensivePlaybook = null, seasonNumber = null) => {
    try {
        const params = {};
        if (offensivePlaybook) params.offensivePlaybook = offensivePlaybook;
        if (defensivePlaybook) params.defensivePlaybook = defensivePlaybook;
        if (seasonNumber) params.seasonNumber = seasonNumber;
        
        const response = await apiClient.get('/playbook-stats/all', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all playbook stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch all playbook stats');
        }
        throw new Error('An unexpected error occurred while fetching all playbook stats');
    }
};

export const getPlaybookStatsByOffensivePlaybookAndDefensivePlaybookAndSeason = async (offensivePlaybook, defensivePlaybook, seasonNumber) => {
    try {
        const params = { offensivePlaybook, defensivePlaybook, seasonNumber };
        const response = await apiClient.get('/playbook-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch playbook stats by offensive playbook, defensive playbook, and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch playbook stats');
        }
        throw new Error('An unexpected error occurred while fetching playbook stats');
    }
};

export const getPlaybookStatsByOffensivePlaybook = async (offensivePlaybook) => {
    try {
        const params = { offensivePlaybook };
        const response = await apiClient.get('/playbook-stats/offensive-playbook', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch playbook stats by offensive playbook:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch playbook stats by offensive playbook');
        }
        throw new Error('An unexpected error occurred while fetching playbook stats by offensive playbook');
    }
};

export const getPlaybookStatsByDefensivePlaybook = async (defensivePlaybook) => {
    try {
        const params = { defensivePlaybook };
        const response = await apiClient.get('/playbook-stats/defensive-playbook', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch playbook stats by defensive playbook:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch playbook stats by defensive playbook');
        }
        throw new Error('An unexpected error occurred while fetching playbook stats by defensive playbook');
    }
};

export const getPlaybookStatsBySeason = async (seasonNumber) => {
    try {
        const params = { seasonNumber };
        const response = await apiClient.get('/playbook-stats/season', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch playbook stats by season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch playbook stats by season');
        }
        throw new Error('An unexpected error occurred while fetching playbook stats by season');
    }
};

export const generateAllPlaybookStats = async () => {
    try {
        const response = await apiClient.post('/playbook-stats/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all playbook stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all playbook stats');
        }
        throw new Error('An unexpected error occurred while generating all playbook stats');
    }
};

export const generatePlaybookStatsForOffensivePlaybookAndSeason = async (offensivePlaybook, seasonNumber) => {
    try {
        const params = { offensivePlaybook, seasonNumber };
        const response = await apiClient.post('/playbook-stats/generate/offensive-playbook-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate playbook stats for offensive playbook and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate playbook stats for offensive playbook and season');
        }
        throw new Error('An unexpected error occurred while generating playbook stats for offensive playbook and season');
    }
};

export const generatePlaybookStatsForDefensivePlaybookAndSeason = async (defensivePlaybook, seasonNumber) => {
    try {
        const params = { defensivePlaybook, seasonNumber };
        const response = await apiClient.post('/playbook-stats/generate/defensive-playbook-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate playbook stats for defensive playbook and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate playbook stats for defensive playbook and season');
        }
        throw new Error('An unexpected error occurred while generating playbook stats for defensive playbook and season');
    }
};

export const generatePlaybookStatsForOffensivePlaybookAndDefensivePlaybookAndSeason = async (offensivePlaybook, defensivePlaybook, seasonNumber) => {
    try {
        const params = { offensivePlaybook, defensivePlaybook, seasonNumber };
        const response = await apiClient.post('/playbook-stats/generate/offensive-defensive-playbook-season', null, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to generate playbook stats for offensive playbook, defensive playbook, and season:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate playbook stats for offensive playbook, defensive playbook, and season');
        }
        throw new Error('An unexpected error occurred while generating playbook stats for offensive playbook, defensive playbook, and season');
    }
};
