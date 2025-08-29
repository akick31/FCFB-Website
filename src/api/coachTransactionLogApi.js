import apiClient from './apiClient';

export const getEntireCoachTransactionLog = async () => {
    try {
        const response = await apiClient.get('/coach_transaction_log');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch coach transaction log:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch coach transaction log");
        }
        throw new Error("An unexpected error occurred while fetching coach transaction log");
    }
};
