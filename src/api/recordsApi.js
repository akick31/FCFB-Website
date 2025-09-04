import apiClient from './apiClient';

// Records API functions - matches RecordsController
export const getAllRecords = async (filters = {}) => {
    try {
        const params = {};
        if (filters.recordName) params.recordName = filters.recordName;
        if (filters.recordType) params.recordType = filters.recordType;
        if (filters.seasonNumber) params.seasonNumber = filters.seasonNumber;
        if (filters.team) params.team = filters.team;
        
        const response = await apiClient.get('/records/all', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch records:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch records');
        }
        throw new Error('An unexpected error occurred while fetching records');
    }
};

export const getRecord = async (recordName, recordType) => {
    try {
        const params = { recordName, recordType };
        const response = await apiClient.get('/records', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch specific record:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch record');
        }
        throw new Error('An unexpected error occurred while fetching record');
    }
};

export const getRecordsBySeason = async (seasonNumber) => {
    try {
        const params = { seasonNumber };
        const response = await apiClient.get('/records/season', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch season records:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch season records');
        }
        throw new Error('An unexpected error occurred while fetching season records');
    }
};

export const getRecordsByTeam = async (team) => {
    try {
        const params = { team };
        const response = await apiClient.get('/records/team', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team records:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch team records');
        }
        throw new Error('An unexpected error occurred while fetching team records');
    }
};

export const getRecordsByStat = async (recordName) => {
    try {
        const params = { recordName };
        const response = await apiClient.get('/records/stat', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch stat records:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch stat records');
        }
        throw new Error('An unexpected error occurred while fetching stat records');
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

export const generateRecord = async (recordName, recordType) => {
    try {
        const requestBody = { recordName, recordType };
        const response = await apiClient.post('/records/generate', requestBody);
        return response.data;
    } catch (error) {
        console.error('Failed to generate specific record:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate record');
        }
        throw new Error('An unexpected error occurred while generating record');
    }
};
