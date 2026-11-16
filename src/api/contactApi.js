import apiClient from './apiClient';

export const sendContactMessage = ({ name, email, subject, message, company }) =>
    apiClient.post('/contact', { name, email, subject, message, company });
