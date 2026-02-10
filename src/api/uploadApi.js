import apiClient from './apiClient';

/**
 * Upload a postseason game logo
 * @param {File} file - The image file to upload
 * @returns {Promise<{url: string}>} The URL/path to the uploaded file
 */
export const uploadPostseasonLogo = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload/postseason-logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to upload postseason logo:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to upload logo');
        }
        throw new Error('An unexpected error occurred while uploading the logo');
    }
};
