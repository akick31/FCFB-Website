export const checkIfUserIsAdmin = () => {
    if (typeof window === 'undefined') return false;
    const role = localStorage.getItem('role');
    return role === 'ADMIN' || role === 'CONFERENCE_COMMISSIONER';
};

export const getStorageItem = (storageArea, key, fallback = '') => {
    if (typeof window === 'undefined') return fallback;
    const storage = storageArea === 'session' ? window.sessionStorage : window.localStorage;
    return storage.getItem(key) ?? fallback;
};
