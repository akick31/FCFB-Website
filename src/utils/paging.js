export const chunkPages = (rows, pageSize) => {
    const size = Math.max(1, pageSize);
    const pages = [];
    for (let start = 0; start < rows.length; start += size) {
        pages.push(rows.slice(start, start + size));
    }
    return pages.length ? pages : [[]];
};

export const groupedPages = (groupOf) => (rows, pageSize) => {
    const groups = [...new Set(rows.map(groupOf))].map((group) => rows.filter((row) => groupOf(row) === group));
    const share = Math.max(1, Math.floor(pageSize / Math.max(1, groups.length)));
    const pageCount = Math.max(1, ...groups.map((group) => Math.ceil(group.length / share)));
    return Array.from({ length: pageCount }, (_, page) =>
        groups.flatMap((group) => group.slice(page * share, (page + 1) * share))
    );
};
