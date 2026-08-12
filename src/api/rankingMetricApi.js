import apiClient from './apiClient';

export const getRankingMetrics = async (season, week, metricType) => {
    try {
        const response = await apiClient.get('/ranking-metric', { params: { season, week, metricType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ranking metrics:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ranking metrics');
        }
        throw new Error('An unexpected error occurred while fetching ranking metrics');
    }
};

export const getRankingMetricWeeks = async (season, metricType) => {
    try {
        const response = await apiClient.get('/ranking-metric/weeks', { params: { season, metricType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ranking metric weeks:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ranking metric weeks');
        }
        throw new Error('An unexpected error occurred while fetching ranking metric weeks');
    }
};

export const getRankingMetricHistory = async (season, team, metricType) => {
    try {
        const response = await apiClient.get('/ranking-metric/history', { params: { season, team, metricType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ranking metric history:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ranking metric history');
        }
        throw new Error('An unexpected error occurred while fetching ranking metric history');
    }
};

export const computeRankingMetrics = async (season, week) => {
    try {
        const response = await apiClient.post('/ranking-metric/compute', null, { params: { season, week } });
        return response.data;
    } catch (error) {
        console.error('Failed to compute ranking metrics:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to compute ranking metrics');
        }
        throw new Error('An unexpected error occurred while computing ranking metrics');
    }
};

export const backfillRankingMetrics = async (season) => {
    try {
        const response = await apiClient.post('/ranking-metric/backfill', null, { params: { season } });
        return response.data;
    } catch (error) {
        console.error('Failed to backfill ranking metrics:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to backfill ranking metrics');
        }
        throw new Error('An unexpected error occurred while backfilling ranking metrics');
    }
};

export const getValidRankingMetricWeeks = async (season) => {
    try {
        const response = await apiClient.get('/ranking-metric/valid-weeks', { params: { season } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch valid weeks:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch valid weeks');
        }
        throw new Error('An unexpected error occurred while fetching valid weeks');
    }
};
