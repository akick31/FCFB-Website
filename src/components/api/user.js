import axios from "axios";

export const getUserById = async (userId) => {
    if (!userId) {
        return {};
    }
    const response = await axios.get(`http://localhost:8080/arceus/users/id?id=${userId}`);
    if (response.status !== 200) {
        return {};
    }
    return response.data;
}

export const updateUsername = async (userId, username) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/username?id=${userId}&newUsername=${username}`);
    return response
}

export const updateEmail = async (userId, email) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/email?id=${userId}&newEmail=${email}`);
    return response
}

export const updatePassword = async (userId, password) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/password?id=${userId}&newPassword=${password}`);
    return response
}

export const updateRole = async (userId, role) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/role?id=${userId}&newRole=${role}`);
    return response
}

export const updateCoachName = async (userId, coachName) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/coach-name?id=${userId}&newCoachName=${coachName}`);
    return response
}

export const updateDiscordTag = async (userId, discordTag) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/discord-tag?id=${userId}&newDiscordTag=${discordTag}`);
    return response
}

export const updateRedditUsername = async (userId, redditUsername) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/reddit-username?id=${userId}&newRedditUsername=${redditUsername}`);
    return response
}

export const updateTeam = async (userId, team) => {
    const response = await axios.put(`http://localhost:8080/arceus/users/update/team?id=${userId}&newTeam=${team}`);
    return response
}

