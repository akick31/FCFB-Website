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

export const yardsPerPlay = (rows, yardsKey, yppKey) => {
    let plays = 0;
    let yards = 0;
    rows.forEach((row) => {
        if (row[yardsKey] != null && row[yppKey]) { plays += row[yardsKey] / row[yppKey]; yards += row[yardsKey]; }
    });
    return plays ? yards / plays : null;
};

export const weightedAverage = (rows, valueKey, weightKey) => {
    let weighted = 0;
    let weight = 0;
    rows.forEach((row) => {
        if (row[valueKey] != null && row[weightKey]) { weighted += row[valueKey] * row[weightKey]; weight += row[weightKey]; }
    });
    return weight ? weighted / weight : null;
};
