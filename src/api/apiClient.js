import axios from 'axios';
import { expireUnauthorizedSession } from '../utils/session';
import { baseURL } from '../config/api';

const apiClient = axios.create({
    baseURL: baseURL,
    timeout: 60000,
    headers: {
        'X-Client-Name': 'fcfb-website',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.has('Authorization')) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        expireUnauthorizedSession(error);
        return Promise.reject(error);
    }
);

export default apiClient;
