import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const PAGE_BOTTOM_PADDING = 32;

const useRoomBelow = ({ reserve = 0, min = 240, max = 900 } = {}) => {
    const [element, setElement] = useState(null);
    const [room, setRoom] = useState(max);

    const measure = useCallback(() => {
        if (!element) {
            return;
        }
        const footer = document.querySelector('footer')?.offsetHeight ?? 60;
        const top = element.getBoundingClientRect().top + window.scrollY;
        const available = window.innerHeight - top - footer - PAGE_BOTTOM_PADDING - reserve;
        setRoom(Math.min(max, Math.max(min, Math.floor(available))));
    }, [element, reserve, min, max]);

    useLayoutEffect(measure, [measure]);
    useEffect(() => {
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [measure]);

    return [setElement, room];
};

export default useRoomBelow;
