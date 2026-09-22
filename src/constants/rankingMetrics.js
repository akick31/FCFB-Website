export const RANKING_METRIC_TYPES = [
    {
        value: 'EQUIVALENT_WINS',
        group: 'COMPUTER',
        label: 'Pythagorean EQW',
        shortLabel: 'EQW',
        higherIsBetter: true,
        description: 'Estimates how many games a team "should" have won based on their season-to-date scoring margins, using the Pythagorean win-expectation formula. Smooths out the noise from close, lucky, or fluky wins and losses.',
    },
    {
        value: 'MARGIN_OF_VICTORY',
        group: 'STAT',
        label: 'Margin of Victory',
        shortLabel: 'MOV',
        higherIsBetter: true,
        description: 'Average point differential per game (points scored minus points allowed). Not capped.',
    },
    {
        value: 'SCORING_OFFENSE',
        group: 'STAT',
        label: 'Scoring Offense',
        higherIsBetter: true,
        description: 'Average points scored per game.',
    },
    {
        value: 'SCORING_DEFENSE',
        group: 'STAT',
        label: 'Scoring Defense',
        higherIsBetter: false,
        description: 'Average points allowed per game. Lower is better.',
    },
    {
        value: 'POWER_RATING',
        group: 'COMPUTER',
        label: 'Nutter Power Rating',
        shortLabel: 'Power Rating',
        higherIsBetter: true,
        description: 'A blended computer rating: 52% Pythagorean EQW, 28% win percentage, and 20% average difference in the number-guessing matchup on offense, defense, and special teams.',
    },
    {
        value: 'COLLEY_MATRIX',
        group: 'COMPUTER',
        label: 'Colley Matrix',
        higherIsBetter: true,
        description: 'A schedule-strength-aware rating (the standard Colley method) based only on wins, losses, and who you played, not scoring margin. Solved as a system of linear equations across every team’s full schedule, so beating good teams counts for more than the score.',
    },
    {
        value: 'ASR',
        group: 'COMPUTER',
        label: 'ASR',
        higherIsBetter: true,
        description: 'Adjusted Strength Rating: a schedule-adjusted scoring margin, in the same family as real computer polls like Sagarin and Massey. Solved as a system of linear equations so a team’s rating equals its average margin of victory plus the average rating of its opponents. Each game’s margin is capped at 28 points.',
    },
    {
        value: 'AVERAGE_OFFENSIVE_DIFF',
        group: 'STAT',
        label: 'Average Offensive Difference',
        shortLabel: 'Offensive Difference',
        columnLabel: 'Difference',
        higherIsBetter: false,
        description: 'Average difference between the offensive and defensive numbers on normal plays while this team has the ball. Lower is better.',
    },
    {
        value: 'AVERAGE_DEFENSIVE_DIFF',
        group: 'STAT',
        label: 'Average Defensive Difference',
        shortLabel: 'Defensive Difference',
        columnLabel: 'Difference',
        higherIsBetter: true,
        description: 'Average difference between the offensive and defensive numbers on normal plays while this team is on defense. Higher is better.',
    },
    {
        value: 'AVERAGE_OFFENSIVE_SPECIAL_TEAMS_DIFF',
        group: 'STAT',
        label: 'Average Offensive Special Teams Difference',
        shortLabel: 'Offensive ST Difference',
        columnLabel: 'Difference',
        higherIsBetter: false,
        description: 'Average difference on this team\'s own kickoffs, field goals, and punts. Lower is better.',
    },
    {
        value: 'AVERAGE_DEFENSIVE_SPECIAL_TEAMS_DIFF',
        group: 'STAT',
        label: 'Average Defensive Special Teams Difference',
        shortLabel: 'Defensive ST Difference',
        columnLabel: 'Difference',
        higherIsBetter: true,
        description: 'Average difference while this team is returning or defending a kick. Higher is better.',
    },
    {
        value: 'COMPOSITE',
        group: 'COMPUTER',
        label: 'Composite',
        higherIsBetter: true,
        description: 'A poll of polls, similar to how the real BCS composite blended human polls and computer rankings into one number. Blends three independent signals after normalizing each to a common 0-100 scale: 45% Colley Matrix for record and schedule, 40% ASR for schedule-adjusted scoring margin, and 15% Pythagorean EQW for scoring efficiency.',
    },
];

export const RANKING_METRIC_GROUPS = [
    { value: 'COMPUTER', label: 'Computer' },
    { value: 'STAT', label: 'Stats' },
];

export const rankingMetricGroup = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.group;

export const rankingMetricLabel = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.label || value;

export const rankingMetricShortLabel = (value) => {
    const entry = RANKING_METRIC_TYPES.find((m) => m.value === value);
    return entry?.shortLabel || entry?.label || value;
};

export const rankingMetricColumnLabel = (value) => {
    const entry = RANKING_METRIC_TYPES.find((m) => m.value === value);
    return entry?.columnLabel || entry?.shortLabel || entry?.label || value;
};

export const rankingMetricHigherIsBetter = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.higherIsBetter ?? true;

export const rankingMetricDescription = (value) => RANKING_METRIC_TYPES.find((m) => m.value === value)?.description || '';
