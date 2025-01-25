import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "https://api.fakecollegefootball.com",
    timeout: 10000,
});

export default apiClient;
