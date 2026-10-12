import { STAT_ROWS } from './teamStatFields';
import { sum, max, mean, rate, averageFromTotals, weightedAverage } from './statAggregation';
const aggregateField = (statDefinition, statRows, aggregatedStats, prefix = '') => {
    const prefixedKey = (name) => `${prefix}${name}`;
    switch (statDefinition.agg) {
        case 'sum':
            aggregatedStats[prefixedKey(statDefinition.key)] = sum(statRows, prefixedKey(statDefinition.key));
            break;
        case 'max':
            aggregatedStats[prefixedKey(statDefinition.key)] = max(statRows, prefixedKey(statDefinition.key));
            break;
        case 'mean':
            aggregatedStats[prefixedKey(statDefinition.key)] = mean(statRows, prefixedKey(statDefinition.key));
            break;
        case 'rate':
            aggregatedStats[prefixedKey(statDefinition.key)] = rate(
                statRows,
                prefixedKey(statDefinition.num),
                prefixedKey(statDefinition.den)
            );
            break;
        case 'ratio':
            aggregatedStats[prefixedKey(statDefinition.num)] = sum(statRows, prefixedKey(statDefinition.num));
            aggregatedStats[prefixedKey(statDefinition.den)] = sum(statRows, prefixedKey(statDefinition.den));
            aggregatedStats[prefixedKey(statDefinition.key)] = averageFromTotals(
                statRows,
                prefixedKey(statDefinition.num),
                prefixedKey(statDefinition.den)
            );
            break;
        case 'wavg':
            aggregatedStats[prefixedKey(statDefinition.key)] = weightedAverage(
                statRows,
                prefixedKey(statDefinition.key),
                prefixedKey(statDefinition.weight)
            );
            break;
        case 'fgratio':
            aggregatedStats[prefixedKey(statDefinition.made)] = sum(statRows, prefixedKey(statDefinition.made));
            aggregatedStats[prefixedKey(statDefinition.att)] = sum(statRows, prefixedKey(statDefinition.att));
            break;
        default:
            break;
    }
};
export const aggregateSeasonStats = (statRows) => {
    if (!Array.isArray(statRows) || statRows.length === 0) {
        return null;
    }
    const aggregatedStats = {};
    STAT_ROWS.forEach((statDefinition) => {
        aggregateField(statDefinition, statRows, aggregatedStats);
        if (statDefinition.opp) {
            aggregateField(statDefinition, statRows, aggregatedStats, 'opponent_');
        }
    });
    return aggregatedStats;
};
