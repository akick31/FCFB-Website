import apiClient from './apiClient';

export const getUserById = async (userId) => {
    if (!userId) return {};

    try {
        const response = await apiClient.get('/user/id', { params: { id: userId } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user by ID:", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await apiClient.get('/user');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all users:", error);
        throw error;
    }
}

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
        throw error;
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
        throw error;
    }
}

// For specific updates like username or email
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
