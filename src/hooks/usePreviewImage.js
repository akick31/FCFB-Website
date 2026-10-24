import { useEffect, useRef, useState } from 'react';

const PREVIEW_DEBOUNCE_MS = 450;

/** Debounced render into an object URL, revoking the previous one. `request` must be stable (memoize it). */
export const usePreviewImage = (render, request) => {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const urlRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const loaded = await render(request);
                if (cancelled) {
                    URL.revokeObjectURL(loaded);
                    return;
                }
                if (urlRef.current) {
                    URL.revokeObjectURL(urlRef.current);
                }
                urlRef.current = loaded;
                setUrl(loaded);
                setError(null);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Preview unavailable');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [render, request]);

    useEffect(
        () => () => {
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
            }
        },
        []
    );

    return { url, loading, error };
};
