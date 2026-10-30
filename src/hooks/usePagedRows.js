import { useEffect, useMemo, useState } from 'react';

const usePagedRows = (rows, pageSize, resetKey) => {
    const [page, setPage] = useState(0);
    useEffect(() => setPage(0), [resetKey]);
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const shownPage = Math.min(page, pageCount - 1);
    const pageRows = useMemo(
        () => rows.slice(shownPage * pageSize, (shownPage + 1) * pageSize),
        [rows, shownPage, pageSize]
    );
    return { page: shownPage, pageCount, pageRows, setPage };
};

export default usePagedRows;
