import apiClient from './apiClient';

export const reportFrontendError = ({ message, stack, url }) => {
    apiClient.post('/internal/frontend-errors', { message, stack, url }).catch(() => {});
};
