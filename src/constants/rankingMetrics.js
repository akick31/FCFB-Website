export const RANKING_METRIC_TYPES = [
    {
        value: 'EQUIVALENT_WINS',
        label: 'Pythagorean EQW',
        shortLabel: 'EQW',
        higherIsBetter: true,
        description: 'Estimates how many games a team "should" have won based on their season-to-date scoring margins, using the Pythagorean win-expectation formula. Smooths out the noise from close, lucky, or fluky wins and losses.',
    },
    {
        value: 'MARGIN_OF_VICTORY',
        label: 'Margin of Victory',
        shortLabel: 'MOV',
        higherIsBetter: true,
        description: 'Average point differential per game (points scored minus points allowed). Shown in full here, with no cap applied.',
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
        description: 'A blended computer rating: 52% Pythagorean EQW, 28% win percentage, and 20% average difference in the number-guessing matchup on offense, defense, and special teams.',
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
        description: 'Adjusted Strength Rating: a schedule-adjusted scoring margin, in the same family as real computer polls like Sagarin and Massey. Solved as a system of linear equations so a team’s rating equals its average margin of victory plus the average rating of its opponents. Each game’s margin is capped at 28 points, so a blowout counts as a decisive win without letting one scoreline dominate the rating.',
    },
    {
        value: 'COMPOSITE',
        label: 'Composite',
        higherIsBetter: true,
        description: 'A poll of polls, similar to how the real BCS composite blended human polls and computer rankings into one number. Blends three independent signals after normalizing each to a common 0-100 scale: 45% Colley Matrix for record and schedule, 40% ASR for schedule-adjusted scoring margin, and 15% Pythagorean EQW for scoring efficiency.',
    },
];

export const rankingMetricLabel = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.label || value;

export const rankingMetricShortLabel = (value) => {
    const entry = RANKING_METRIC_TYPES.find((m) => m.value === value);
    return entry?.shortLabel || entry?.label || value;
};

export const rankingMetricHigherIsBetter = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.higherIsBetter ?? true;

export const rankingMetricDescription = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.description || '';
