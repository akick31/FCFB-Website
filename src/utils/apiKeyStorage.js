const STORAGE_KEY = 'apiKey';
const hasLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getStoredApiKey = () => (hasLocalStorage ? localStorage.getItem(STORAGE_KEY) || '' : '');

export const setStoredApiKey = (value) => {
    if (!hasLocalStorage) return;
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
};
