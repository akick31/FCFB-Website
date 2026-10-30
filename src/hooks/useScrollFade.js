import { useCallback, useEffect, useRef, useState } from 'react';

const useScrollFade = () => {
    const ref = useRef(null);
    const [edges, setEdges] = useState({ start: false, end: false });

    const measure = useCallback(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        const start = element.scrollLeft > 1;
        const end = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
        setEdges((current) => (current.start === start && current.end === end ? current : { start, end }));
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return undefined;
        }
        measure();
        element.addEventListener('scroll', measure, { passive: true });
        window.addEventListener('resize', measure);
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        observer?.observe(element);
        if (element.firstElementChild) {
            observer?.observe(element.firstElementChild);
        }
        return () => {
            element.removeEventListener('scroll', measure);
            window.removeEventListener('resize', measure);
            observer?.disconnect();
        };
    }, [measure]);

    return { ref, edges };
};

export default useScrollFade;
