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