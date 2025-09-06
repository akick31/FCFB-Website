import apiClient from './apiClient';

// Records API functions - matches RecordsController
export const getFilteredRecords = async (season = null, conference = null, recordType = null, recordName = null, page = 0, size = 20) => {
    try {
        const params = { page, size };
        if (season) params.season = season;
        if (conference) params.conference = conference;
        if (recordType) params.recordType = recordType;
        if (recordName) params.recordName = recordName;
        
        const response = await apiClient.get('/records', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch filtered records:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch filtered records');
        }
        throw new Error('An unexpected error occurred while fetching filtered records');
    }
};

export const generateAllRecords = async () => {
    try {
        const response = await apiClient.post('/records/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all records:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all records');
        }
        throw new Error('An unexpected error occurred while generating all records');
    }
};
