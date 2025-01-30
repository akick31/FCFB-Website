import apiClient from './apiClient';

export const getFilteredScorebugs = async (filters, category, sort, conference, season, week, page, size) => {
    try {
        const response = await apiClient.get('/arceus/scorebug/filtered', {
            params: {
                filters,
                category,
                sort,
                conference,
                season,
                week,
                page,
                size
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch scorebugs:", error);
        throw error;
    }
};
