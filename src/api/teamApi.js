import apiClient from './apiClient';

export const getTeamByName = async (teamName) => {
    if (!teamName) return {};

    try {
        const response = await apiClient.get('/team/name', { params: { name: teamName } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch team by name:", error);
        throw error;
    }
};

export const getTeamById = async (id) => {
    if (!id) return {};

    try {
        const response = await apiClient.get('/team/id', { params: { id: id } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch team by id:", error);
        throw error;
    }
};

export const getAllTeams = async () => {
    try {
        const response = await apiClient.get('/team');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all teams:", error);
        throw error;
    }
}

export const getOpenTeams = async () => {
    try {
        const response = await apiClient.get('/team/open');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch open teams:", error);
        throw error;
    }
}

export const updateTeam = async (team) => {
    try {
        const response = await apiClient.put('/team', team);
        return response.data;
    } catch (error) {
        console.error("Failed to update team:", error);
        throw error;
    }
};
