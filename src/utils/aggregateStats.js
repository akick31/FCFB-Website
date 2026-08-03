import { STAT_ROWS } from './teamStatFields';
import { sum, max, mean, rate, yardsPerPlay, weightedAverage } from './statAggregation';

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
