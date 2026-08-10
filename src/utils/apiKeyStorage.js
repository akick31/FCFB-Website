const STORAGE_KEY = 'apiKey';

export const getStoredApiKey = () => localStorage.getItem(STORAGE_KEY) || '';

export const setStoredApiKey = (value) => {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
};
