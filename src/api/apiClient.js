import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://51.81.32.234:1212",
    timeout: 10000,
});

export default apiClient;
