export const SITE_URL = 'https://fakecollegefootball.com';

export const routeList = [
    { path: '/', title: 'Fake College Football | Home', description: 'Fake College Football (FCFB) is a play-by-play college football simulation league. Follow live games, conference standings, national rankings, and team stats.' },
    { path: '/standings', title: 'Standings | Fake College Football', description: 'Live conference and league standings for every Fake College Football conference, updated weekly as the season progresses.' },
    { path: '/rankings', title: 'Rankings | Fake College Football', description: 'Weekly national rankings for every team in the Fake College Football simulation league.' },
    { path: '/scoreboard', title: 'Scoreboard | Fake College Football', description: 'Live and final scores for every Fake College Football game, including ongoing games, completed matchups, and scrimmages.' },
    { path: '/teams', title: 'Teams | Fake College Football', description: 'Browse every team in the Fake College Football league, filter by conference, and view team pages and rosters.' },
    { path: '/schedules', title: 'Schedules | Fake College Football', description: 'Full season and postseason schedules for every Fake College Football team and conference.' },
    { path: '/records', title: 'Records | Fake College Football', description: 'All-time and single-season records across the Fake College Football league, from top offenses to record-breaking performances.' },
    { path: '/season-stats', title: 'Season Stats | Fake College Football', description: 'Team and player statistics for every season in Fake College Football, covering offense, defense, and special teams.' },
    { path: '/league-stats', title: 'League Stats | Fake College Football', description: 'League-wide statistical leaders and team comparisons across Fake College Football seasons.' },
    { path: '/leaderboard', title: 'Leaderboard | Fake College Football', description: 'Career and season leaderboards for Fake College Football coaches and teams.' },
    { path: '/elo-history', title: 'ELO History | Fake College Football', description: "Track how every Fake College Football team's ELO rating has changed week by week and season by season." },
    { path: '/charts', title: 'Charts | Fake College Football', description: 'Interactive charts visualizing ELO history, ranking movement, and statistical trends across Fake College Football.' },
];

export const ROUTE_META = Object.fromEntries(routeList.map(route => [route.path, route]));
