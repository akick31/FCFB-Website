import apiClient from './apiClient';

export const getLatestScorebugByGameId = async (gameId) => {
    try {
        // Request the scorebug image as a Blob (binary data)
        const response = await apiClient.get(`/arceus/scorebug/latest`, {
            params: { gameId },
            responseType: 'blob', // Set response type to 'blob' to get the binary data
        });

        // Convert the Blob into a byte array (Uint8Array)
        const arrayBuffer = await response.data.arrayBuffer();
        // Return the byte array (or you could return the arrayBuffer if needed)
        return new Uint8Array(arrayBuffer);

    } catch (error) {
        console.error("Failed to fetch game scorebug:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};

export const generateScorebugByGameId = async (gameId) => {
    try {
        // Request the scorebug image as a Blob (binary data)
        await apiClient.post(`/arceus/scorebug/generate?gameId=${gameId}`);
    } catch (error) {
        console.error("Failed to genteera game scorebug:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
};
