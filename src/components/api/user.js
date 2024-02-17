import axios from "axios";

export const registerUser = async (formData) => {
    const response = await axios.post('http://localhost:8080/arceus/users', formData);
    return response
}

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