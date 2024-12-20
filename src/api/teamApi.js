import apiClient from './apiClient';

export const getTeamByName = async (teamName) => {
    if (!teamName) return {};

    try {
        const response = await apiClient.get('/arceus/team/name', { params: { name: teamName } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch team by name:", error);
        throw error;
    }
};

export const getAllTeams = async () => {
    try {
        const response = await apiClient.get('/arceus/team');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all teams:", error);
        throw error;
    }
}
