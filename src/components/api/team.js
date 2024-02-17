import axios from "axios";

export const getTeamByName = async (teamName) => {
    if (!teamName) {
        return {};
    }
    const response = await axios.get(`http://localhost:8080/arceus/teams/name?name=${teamName}`);
    if (response.status !== 200) {
        return {};
    }
    return response.data;
}