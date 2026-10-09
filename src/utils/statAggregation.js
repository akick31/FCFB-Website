export const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] || 0), 0);
export const max = (rows, key) => rows.reduce((best, row) => Math.max(best, row[key] || 0), 0);

export const mean = (rows, key) => {
    const values = rows.map((row) => row[key]).filter((value) => value != null);
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
};

export const rate = (rows, numKey, denKey) => {
    const denominator = sum(rows, denKey);
    return denominator ? (sum(rows, numKey) / denominator) * 100 : null;
};

export const averageFromTotals = (rows, totalKey, countKey) => {
    const count = sum(rows, countKey);
    return count ? sum(rows, totalKey) / count : null;
};

export const weightedAverage = (rows, valueKey, weightKey) => {
    let weighted = 0;
    let weight = 0;
    rows.forEach((row) => {
        if (row[valueKey] != null && row[weightKey]) { weighted += row[valueKey] * row[weightKey]; weight += row[weightKey]; }
    });
    return weight ? weighted / weight : null;
};
