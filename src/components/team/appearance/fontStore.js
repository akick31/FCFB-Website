import { useEffect, useState } from 'react';
import { getFonts } from '../../../api/fontApi';
let cachedFonts = null;
let fontsRequest = null;
const listeners = new Set();
const loadFonts = () => {
    if (cachedFonts) {
        return Promise.resolve(cachedFonts);
    }
    if (!fontsRequest) {
        fontsRequest = getFonts()
            .then((fonts) => {
                cachedFonts = fonts;
                fontsRequest = null;
                listeners.forEach((l) => l(cachedFonts));
                return cachedFonts;
            })
            .catch(() => {
                fontsRequest = null;
                return cachedFonts || [];
            });
    }
    return fontsRequest;
};
export const registerUploadedFont = (option) => {
    if (!option) {
        return;
    }
    const next = (cachedFonts || []).filter((f) => f.value !== option.value);
    cachedFonts = [...next, option].sort((a, b) => a.label.localeCompare(b.label));
    listeners.forEach((l) => l(cachedFonts));
};
export const removeFont = (value) => {
    cachedFonts = (cachedFonts || []).filter((f) => f.value !== value);
    listeners.forEach((l) => l(cachedFonts));
};
export const useFonts = () => {
    const [fonts, setFonts] = useState(cachedFonts || []);
    useEffect(() => {
        let mounted = true;
        loadFonts().then((f) => {
            if (mounted) {
                setFonts(f);
            }
        });
        const listener = (f) => setFonts([...f]);
        listeners.add(listener);
        return () => {
            mounted = false;
            listeners.delete(listener);
        };
    }, []);
    return fonts;
};
