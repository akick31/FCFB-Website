import { useEffect, useState } from 'react';
import { getFonts } from '../../../api/fontApi';

let cached = null;
let inflight = null;
const listeners = new Set();

const load = () => {
    if (cached) return Promise.resolve(cached);
    if (!inflight) {
        inflight = getFonts()
            .then((fonts) => { cached = fonts; inflight = null; listeners.forEach((l) => l(cached)); return cached; })
            .catch(() => { cached = []; inflight = null; return cached; });
    }
    return inflight;
};

export const registerUploadedFont = (option) => {
    if (!option) return;
    const next = (cached || []).filter((f) => f.value !== option.value);
    cached = [...next, option].sort((a, b) => a.label.localeCompare(b.label));
    listeners.forEach((l) => l(cached));
};

export const useFonts = () => {
    const [fonts, setFonts] = useState(cached || []);
    useEffect(() => {
        let mounted = true;
        load().then((f) => { if (mounted) setFonts(f); });
        const listener = (f) => setFonts([...f]);
        listeners.add(listener);
        return () => { mounted = false; listeners.delete(listener); };
    }, []);
    return fonts;
};
