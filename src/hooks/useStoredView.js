import { useState } from 'react';

const read = (key, fallback) => {
    try {
        return window.localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
};

const useStoredView = (key, fallback = 'cards') => {
    const [view, setView] = useState(() => read(key, fallback));
    const change = (next) => {
        setView(next);
        try {
            window.localStorage.setItem(key, next);
        } catch {
            return;
        }
    };
    return [view, change];
};

export default useStoredView;
