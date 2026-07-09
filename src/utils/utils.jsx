export const checkIfUserIsAdmin = () => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN' || role === 'CONFERENCE_COMMISSIONER';
    return isAdmin;
};

export const getStorageItem = (storageArea, key, fallback = '') => {
    if (typeof window === 'undefined') return fallback;
    const storage = storageArea === 'session' ? window.sessionStorage : window.localStorage;
    return storage.getItem(key) ?? fallback;
};
