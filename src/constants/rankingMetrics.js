export const RANKING_METRIC_TYPES = [
    {
        value: 'EQUIVALENT_WINS',
        label: 'Pythagorean EQW',
        higherIsBetter: true,
        description: 'Estimates how many games a team "should" have won based on their season-to-date scoring margins, using the Pythagorean win-expectation formula. Smooths out the noise from close, lucky, or fluky wins and losses.',
    },
    {
        value: 'MARGIN_OF_VICTORY',
        label: 'Margin of Victory',
        higherIsBetter: true,
        description: 'Average point differential per game (points scored minus points allowed).',
    },
    {
        value: 'SCORING_OFFENSE',
        label: 'Scoring Offense',
        higherIsBetter: true,
        description: 'Average points scored per game.',
    },
    {
        value: 'SCORING_DEFENSE',
        label: 'Scoring Defense',
        higherIsBetter: false,
        description: 'Average points allowed per game. Lower is better.',
    },
    {
        value: 'POWER_RATING',
        label: 'Nutter Power Rating',
        shortLabel: 'Power Rating',
        higherIsBetter: true,
        description: 'A blended computer rating: 58.5% Pythagorean EQW, 31.5% win percentage, and 10% average difference in the number-guessing matchup on offense, defense, and special teams.',
    },
    {
        value: 'COLLEY_MATRIX',
        label: 'Colley Matrix',
        higherIsBetter: true,
        description: 'A schedule-strength-aware rating (the standard Colley method) based only on wins, losses, and who you played, not scoring margin. Solved as a system of linear equations across every team’s full schedule, so beating good teams counts for more than the score.',
    },
    {
        value: 'ASR',
        label: 'ASR',
        higherIsBetter: true,
        description: 'Adjusted Strength Rating: a schedule-adjusted scoring margin, in the same family as real computer polls like Sagarin and Massey. Solved as a system of linear equations so a team’s rating equals its average margin of victory plus the average rating of its opponents.',
    },
    {
        value: 'COMPOSITE',
        label: 'Composite',
        higherIsBetter: true,
        description: 'A poll of polls, similar to how the real BCS composite blended human polls and computer rankings into one number. Averages this system’s other computer rankings after normalizing each to a common 0-100 scale.',
    },
];

export const rankingMetricLabel = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.label || value;

export const rankingMetricShortLabel = (value) => {
    const entry = RANKING_METRIC_TYPES.find((m) => m.value === value);
    return entry?.shortLabel || entry?.label || value;
};

export const rankingMetricHigherIsBetter = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.higherIsBetter ?? true;

export const rankingMetricDescription = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.description || '';
