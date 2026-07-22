export const NAV_ITEMS = [
    { label: 'Home', path: '/' },
    { label: 'Scoreboard', path: '/scoreboard' },
    { label: 'Standings', path: '/standings' },
    { label: 'Rankings', path: '/rankings' },
    { label: 'Schedules', path: '/schedules' },
    { label: 'Teams', path: '/teams' },
    { label: 'Charts', path: '/charts' },
];

export const STATS_ITEMS = [
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Records', path: '/records' },
    { label: 'Season Stats', path: '/season-stats' },
    { label: 'League Stats', path: '/league-stats' },
];

export const STATS_PATHS = STATS_ITEMS.map((item) => item.path);
