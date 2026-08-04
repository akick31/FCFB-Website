import apiClient from "./apiClient";

export const getNewSignups = async () => {
    try {
        const response = await apiClient.get('/new_signups');
        return response.data;
    } catch (error) {
        console.error("Failed to fetch new signups:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to fetch new signups");
        }
        throw new Error("An unexpected error occurred while fetching new signups");
    }
}

export const deleteNewSignup = async (id) => {
    try {
        const response = await apiClient.delete(`/new_signups/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete new signup:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to delete new signup");
        }
        throw new Error("An unexpected error occurred while deleting new signup");
    }
}

export const hireFromSignup = async ({ signupId, team, coachPosition, processedBy }) => {
    try {
        const response = await apiClient.post(`/new_signups/${signupId}/hire`, null, {
            params: { team, coachPosition, processedBy }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to hire from signup:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to hire from signup");
        }
        throw new Error("An unexpected error occurred while hiring from signup");
    }
}