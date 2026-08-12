export const ADJUSTED_PPG_METRIC_TYPES = [
    {
        value: 'ADJUSTED_POINTS_FOR',
        shortLabel: 'aPPf',
        label: 'Adjusted Points For',
        higherIsBetter: true,
        description: 'Schedule-adjusted points scored per game (offense-only split of the ASR methodology).',
    },
    {
        value: 'ADJUSTED_POINTS_AGAINST',
        shortLabel: 'aPPa',
        label: 'Adjusted Points Against',
        higherIsBetter: false,
        description: 'Schedule-adjusted points allowed per game (defense-only split of the ASR methodology). Lower is better.',
    },
    {
        value: 'ADJUSTED_NET_POINTS',
        shortLabel: 'aPPn',
        label: 'Adjusted Net Points',
        higherIsBetter: true,
        description: 'Schedule-adjusted net scoring margin per game, the same rating as ASR.',
    },
];

export const adjustedMetricShortLabel = (value) => ADJUSTED_PPG_METRIC_TYPES.find((m) => m.value === value)?.shortLabel || value;

export const adjustedMetricHigherIsBetter = (value) => ADJUSTED_PPG_METRIC_TYPES.find((m) => m.value === value)?.higherIsBetter ?? true;
