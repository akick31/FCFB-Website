import apiClient from './apiClient';

export const getTeamByName = async (teamName) => {
    if (!teamName) return {};

    try {
        const response = await apiClient.get('/team/name', { params: { name: teamName } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch team by name:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch team by name");
        }
        throw new Error("An unexpected error occurred while fetching team by name");
    }
};

export const getTeamById = async (id) => {
    if (!id) return {};

    try {
        const response = await apiClient.get(`/team/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch team by id:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch team by id");
        }
        throw new Error("An unexpected error occurred while fetching team by id");
    }
};

export const getAllTeams = async () => {
    try {
        const response = await apiClient.get('/team');

        return response.data.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
    } catch (error) {
        console.error("Failed to fetch all teams:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch all teams");
        }
        throw new Error("An unexpected error occurred while fetching all teams");
    }
};

export const getOpenTeams = async () => {
    try {
        const response = await apiClient.get('/team/open');

        return response.data.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
    } catch (error) {
        console.error("Failed to fetch open teams:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch open teams");
        }
        throw new Error("An unexpected error occurred while fetching open teams");
    }
};

export const updateTeam = async (team) => {
    try {
        const response = await apiClient.put('/team', team);
        return response.data;
    } catch (error) {
        console.error("Failed to update team:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update team");
        }
        throw new Error("An unexpected error occurred while updating team");
    }
};

export const hireCoach = async ({ team = null, discordId, coachPosition, processedBy }) => {
    if (!discordId || !coachPosition || !processedBy) {
        throw new Error("Missing required parameters: discordId, coachPosition, and processedBy are required.");
    }

    try {
        const response = await apiClient.post('/team/hire', null, {
            params: {
                team,
                discordId,
                coachPosition,
                processedBy
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to hire coach:", error);
        if (error.response) {
            if (error.response.data.error.includes("User not found with Discord ID")) {
                throw new Error("User not found with Discord ID, please ensure the user has been verified");
            }
            throw new Error(error.response.data.error || "Failed to hire coach");
        }
        throw new Error("An unexpected error occurred while hiring coach");
    }
};

export const hireInterimCoach = async ({ team = null, discordId, processedBy }) => {
    if (!discordId || !processedBy) {
        throw new Error("Missing required parameters: discordId and processedBy are required.");
    }

    try {
        const response = await apiClient.post('/team/hire/interim', null, {
            params: {
                team,
                discordId,
                processedBy
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to hire interim coach:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to hire interim coach");
        }
        throw new Error("An unexpected error occurred while hiring interim coach");
    }
}

export const fireCoach = async ({ team = null, processedBy }) => {
    if (!team || !processedBy) {
        throw new Error("Missing required parameters: team and processedBy is required.");
    }

    try {
        const response = await apiClient.post('/team/fire', null, {
            params: {
                team,
                processedBy
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fire coach:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fire coach");
        }
        throw new Error("An unexpected error occurred while firing coach");
    }
};