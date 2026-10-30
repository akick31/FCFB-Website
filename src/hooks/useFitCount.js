import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const PHONE_WIDTH = 600;

const footerHeight = () => document.querySelector('footer')?.offsetHeight ?? 60;

const rowTopsOf = (items) => [...new Set(items.map((item) => Math.round(item.getBoundingClientRect().top)))];

const pitchOf = (items, tops, fallback) => {
    if (items.length === 0) {
        return fallback;
    }
    const sorted = [...tops].sort((a, b) => a - b);
    const measured =
        sorted.length > 1
            ? (sorted[sorted.length - 1] - sorted[0]) / (sorted.length - 1)
            : items[0].getBoundingClientRect().height;
    return measured > 0 ? measured : fallback;
};

const contentBottomOf = (element) => {
    const wrap = element.closest('[data-page-wrap]');
    const siblings = wrap?.parentElement ? [...wrap.parentElement.children] : [element];
    return Math.max(...siblings.map((child) => child.getBoundingClientRect().bottom));
};

const ROUNDING_MARGIN = 2;

const pagePaddingOf = (element) => {
    const wrap = element.closest('[data-page-wrap]');
    return wrap ? parseFloat(getComputedStyle(wrap).paddingBottom) || 0 : 0;
};

const overflowOf = (element, ownBottom, reserveBelow) => {
    const bottom = ownBottom
        ? element.getBoundingClientRect().bottom + reserveBelow + pagePaddingOf(element) + ROUNDING_MARGIN
        : contentBottomOf(element);
    return bottom + footerHeight() - window.innerHeight;
};

const columnsOf = (element, items, tops, columnWidth) => {
    if (!columnWidth) {
        return 1;
    }
    if (tops.length > 1) {
        return items.filter((item) => Math.round(item.getBoundingClientRect().top) === tops[0]).length;
    }
    return Math.max(1, Math.floor(element.clientWidth / columnWidth));
};

const useFitCount = ({
    itemSelector = 'tbody tr',
    rowHeight = 40,
    minRows = 4,
    maxRows = 40,
    columnWidth,
    initialRows = 8,
    phoneCount = 10,
    resetKey,
    ownBottom = false,
    reserveBelow = 0,
}) => {
    const [element, setElement] = useState(null);
    const [rows, setRows] = useState(initialRows);
    const [columns, setColumns] = useState(1);
    const [phone, setPhone] = useState(false);
    const ceilingRef = useRef(maxRows);

    const measure = useCallback(() => {
        if (!element) {
            return;
        }
        setPhone(window.innerWidth < PHONE_WIDTH);
        const items = [...element.querySelectorAll(itemSelector)];
        const tops = rowTopsOf(items);
        setColumns(columnsOf(element, items, tops, columnWidth));
        const pitch = pitchOf(items, tops, rowHeight);
        const overflow = overflowOf(element, ownBottom, reserveBelow);
        setRows((current) => {
            const shown = tops.length;
            if (overflow <= 0 && shown < current) {
                return current;
            }
            if (overflow > 0) {
                const next = Math.max(minRows, shown - Math.ceil(overflow / pitch));
                ceilingRef.current = Math.min(ceilingRef.current, next);
                return next;
            }
            const grown = shown + Math.floor(-overflow / pitch);
            return Math.max(minRows, Math.min(grown, ceilingRef.current, maxRows));
        });
    }, [element, itemSelector, rowHeight, minRows, maxRows, columnWidth, ownBottom, reserveBelow]);

    useLayoutEffect(() => {
        ceilingRef.current = maxRows;
    }, [resetKey, maxRows]);

    useLayoutEffect(measure, [measure]);
    useEffect(() => {
        if (!element) {
            return undefined;
        }
        const resize = () => {
            ceilingRef.current = maxRows;
            measure();
        };
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        observer.observe(document.body);
        window.addEventListener('resize', resize);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', resize);
        };
    }, [element, measure, maxRows]);

    return [setElement, phone ? phoneCount : rows * columns];
};

export default useFitCount;
