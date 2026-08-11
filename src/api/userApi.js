import apiClient from './apiClient';

export const getUserById = async (userId) => {
    if (!userId) {
        return {};
    }
    
    try {
        const response = await apiClient.get('/user', { params: { userId } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user by ID:", error);
        console.error("Error response:", error.response);

        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch user by ID");
        }
        throw new Error("An unexpected error occurred while fetching user by ID");
    }
};

export const getAllUsers = async () => {
    try {
        const response = await apiClient.get('/user/all');
        return response.data.sort((a, b) => {
            if (a.discord_tag < b.discord_tag) {
                return -1;
            }
            if (a.discord_tag > b.discord_tag) {
                return 1;
            }
            return 0;
        });
    } catch (error) {
        console.error("Failed to fetch all users:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch all users");
        }
        throw new Error("An unexpected error occurred while fetching all users");
    }
};

export const updateUser = async (user) => {
    const body = {
        id: user.id,
        username: user.username,
        coach_name: user.coach_name,
        discord_tag: user.discord_tag,
        discord_id: user.discord_id ?? null,
        position: user.position,
        role: user.role,
        team: user.team || null,
        wins: user.wins || 0,
        losses: user.losses || 0,
        conference_wins: user.conference_wins || 0,
        conference_losses: user.conference_losses || 0,
        conference_championship_wins: user.conference_championship_wins || 0,
        conference_championship_losses: user.conference_championship_losses || 0,
        bowl_wins: user.bowl_wins || 0,
        bowl_losses: user.bowl_losses || 0,
        playoff_wins: user.playoff_wins || 0,
        playoff_losses: user.playoff_losses || 0,
        national_championship_wins: user.national_championship_wins || 0,
        national_championship_losses: user.national_championship_losses || 0,
        offensive_playbook: user.offensive_playbook,
        defensive_playbook: user.defensive_playbook,
    };
    try {
        const response = await apiClient.put('/user/update', body);
        return response.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to update user');
        }
        throw new Error('An unexpected error occurred while updating user');
    }
};

export const validateUser = async (formData) => {
    try {
        const response = await apiClient.post("/user/validate", {
            discord_id: formData.discord_id,
            discord_tag: formData.discord_tag,
            username: formData.username,
            email: formData.email,
        });
        return response.data;
    } catch (error) {
        console.error("Error validating user fields:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Error validating user");
        }
        throw new Error("An unexpected error occurred while validating user");
    }
}

export const getFreeAgents = async () => {
    try {
        const response = await apiClient.get('/user/free_agents');
        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.data.error.includes("No free agents found")) {
                return [];
            }
            throw new Error(error.response.data.error || "Failed to fetch free agents");
        }
        console.error("Failed to fetch free agents:", error);
        throw new Error("An unexpected error occurred while fetching free agents");
    }
}

export const generateApiKey = async () => {
    try {
        const response = await apiClient.post('/user/api-key');
        return response.data.apiKey;
    } catch (error) {
        console.error('Failed to generate API key:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate API key');
        }
        throw new Error('An unexpected error occurred while generating the API key');
    }
};

export const revokeApiKey = async () => {
    try {
        await apiClient.post('/user/api-key/revoke');
    } catch (error) {
        console.error('Failed to revoke API key:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to revoke API key');
        }
        throw new Error('An unexpected error occurred while revoking the API key');
    }
};

export const updateUsername = async (userId, newUsername) => {
    if (!userId) throw new Error("User ID is required");

    try {
        const response = await apiClient.put('/user/update/username', null, {
            params: { id: userId, newUsername },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update username:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update username");
        }
        throw new Error("An unexpected error occurred while updating username");
    }
};

export const updateEmail = async (userId, newEmail) => {
    if (!userId) throw new Error("User ID is required");

    try {
        const response = await apiClient.put('/user/update/email', null, {
            params: { id: userId, newEmail },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update email:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update email");
        }
        throw new Error("An unexpected error occurred while updating email");
    }
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
    if (!userId) throw new Error("User ID is required");

    try {
        const response = await apiClient.put('/user/update/password', null, {
            params: { id: userId, currentPassword, newPassword },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update password:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update password");
        }
        throw new Error("An unexpected error occurred while updating password");
    }
};
