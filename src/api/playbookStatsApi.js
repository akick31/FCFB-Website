import apiClient from './apiClient';

// Playbook Stats API functions
export const getFilteredPlaybookStats = async (offensivePlaybook = null, defensivePlaybook = null, season = null, page = 0, size = 20) => {
    try {
        const params = { page, size };
        if (offensivePlaybook) params.offensivePlaybook = offensivePlaybook;
        if (defensivePlaybook) params.defensivePlaybook = defensivePlaybook;
        if (season) params.season = season;
        
        const response = await apiClient.get('/playbook-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch filtered playbook stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch filtered playbook stats');
        }
        throw new Error('An unexpected error occurred while fetching filtered playbook stats');
    }
};

export const generateAllPlaybookStats = async () => {
    try {
        const response = await apiClient.post('/playbook-stats/generate');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all playbook stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all playbook stats');
        }
        throw new Error('An unexpected error occurred while generating all playbook stats');
    }
};
