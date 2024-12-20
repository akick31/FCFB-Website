import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
    // Initialize state with the value from localStorage if it exists,
    // otherwise use the provided initialValue
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage whenever the value changes
    useEffect(() => {
        try {
            // Save to localStorage
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, value]);

    return [value, setValue];
};

export default useLocalStorage;