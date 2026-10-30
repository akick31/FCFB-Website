import apiClient from './apiClient';

export const uploadLogo = async (file, kind) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', kind);

        const response = await apiClient.post('/upload/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to upload logo:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to upload logo');
        }
        throw new Error('An unexpected error occurred while uploading the logo');
    }
};
