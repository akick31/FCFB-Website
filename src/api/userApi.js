import apiClient from './apiClient';

export const getUserById = async (userId) => {
    if (!userId) return {};

    try {
        const response = await apiClient.get('/user/id', { params: { id: userId } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user by ID:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch user by ID");
        }
        throw new Error("An unexpected error occurred while fetching user by ID");
    }
};

export const getAllUsers = async () => {
    try {
        const response = await apiClient.get('/user');
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

export const updateUserDetails = async (userId, updates) => {
    if (!userId) throw new Error("User ID is required");

    try {
        const response = await apiClient.put('/user/update', {
            id: userId,
            ...updates,
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update user details:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to update user details");
        }
        throw new Error("An unexpected error occurred while updating user details");
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
        console.log("User validation response:", response.data);
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

export const updateUsername = async (userId, username) =>
    updateUserDetails(userId, { newUsername: username });

export const updateEmail = async (userId, email) =>
    updateUserDetails(userId, { newEmail: email });

export const updatePassword = async (userId, password) =>
    updateUserDetails(userId, { newPassword: password });

export const updateRole = async (userId, role) =>
    updateUserDetails(userId, { newRole: role });

export const updateCoachName = async (userId, coachName) =>
    updateUserDetails(userId, { newCoachName: coachName });

export const updateDiscordTag = async (userId, discordTag) =>
    updateUserDetails(userId, { newDiscordTag: discordTag });

export const updateTeam = async (userId, team) =>
    updateUserDetails(userId, { newTeam: team });