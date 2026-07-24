import { STAT_ROWS } from './teamStatFields';

const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] || 0), 0);
const max = (rows, key) => rows.reduce((best, row) => Math.max(best, row[key] || 0), 0);

const mean = (rows, key) => {
    const values = rows.map((row) => row[key]).filter((value) => value != null);
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
};

const rate = (rows, numKey, denKey) => {
    const denominator = sum(rows, denKey);
    return denominator ? (sum(rows, numKey) / denominator) * 100 : null;
};

const yardsPerPlay = (rows, yardsKey, yppKey) => {
    let plays = 0;
    let yards = 0;
    rows.forEach((row) => {
        if (row[yardsKey] != null && row[yppKey]) { plays += row[yardsKey] / row[yppKey]; yards += row[yardsKey]; }
    });
    return plays ? yards / plays : null;
};

const weightedAverage = (rows, valueKey, weightKey) => {
    let weighted = 0;
    let weight = 0;
    rows.forEach((row) => {
        if (row[valueKey] != null && row[weightKey]) { weighted += row[valueKey] * row[weightKey]; weight += row[weightKey]; }
    });
    return weight ? weighted / weight : null;
};

const aggregateField = (row, rows, result, prefix = '') => {
    const p = (name) => `${prefix}${name}`;
    switch (row.agg) {
        case 'sum':
            result[p(row.key)] = sum(rows, p(row.key));
            break;
        case 'max':
            result[p(row.key)] = max(rows, p(row.key));
            break;
        case 'mean':
            result[p(row.key)] = mean(rows, p(row.key));
            break;
        case 'rate':
            result[p(row.key)] = rate(rows, p(row.num), p(row.den));
            break;
        case 'ypp':
            result[p(row.key)] = yardsPerPlay(rows, p(row.yards), p(row.key));
            break;
        case 'wavg':
            result[p(row.key)] = weightedAverage(rows, p(row.key), p(row.weight));
            break;
        case 'fgratio':
            result[p(row.made)] = sum(rows, p(row.made));
            result[p(row.att)] = sum(rows, p(row.att));
            break;
        default:
            break;
    }
};

export const aggregateSeasonStats = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const result = {};
    STAT_ROWS.forEach((row) => {
        aggregateField(row, rows, result);
        if (row.opp) aggregateField(row, rows, result, 'opponent_');
    });
    return result;
};
