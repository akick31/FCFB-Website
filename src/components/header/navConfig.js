export const NAV_ITEMS = [{ label: 'Home', path: '/' }];

const TOOLS_ITEMS = [
    { label: 'Scouting Report', path: '/tools/scouting-report' },
    { label: 'Winsipedia', path: '/tools/head-to-head' },
    { label: 'Matchup Previewer', path: '/tools/matchup-preview' },
    { label: 'Coach Tendency Card', path: '/tools/coach-tendencies' },
    { label: 'Drive Chart & Replay', path: '/tools/drive-chart' },
    { label: 'Rice Sheet', path: '/rice-sheet' },
    { label: 'API Docs', path: '/developers' },
];

export const NAV_MENUS = [
    {
        label: 'Games',
        items: [
            { label: 'Scoreboard', path: '/scoreboard' },
            { label: 'Schedule', path: '/schedules' },
            { label: 'History', path: '/history' },
        ],
    },
    {
        label: 'League',
        items: [
            { label: 'Standings', path: '/standings' },
            { label: 'Rankings', path: '/rankings' },
            { label: 'Teams', path: '/teams' },
            { label: 'Coaches', path: '/coaches' },
            { label: 'Stadiums', path: '/stadiums' },
        ],
    },
    {
        label: 'Stats',
        items: [
            { label: 'Leaderboards', path: '/stats' },
            { label: 'Records', path: '/records' },
            { label: 'Graphs', path: '/graphs' },
        ],
    },
    { label: 'Tools', items: TOOLS_ITEMS },
];
