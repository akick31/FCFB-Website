export const SITE_URL = 'https://fakecollegefootball.com';

export const routeList = [
    { path: '/', title: 'Home | FCFB', description: 'Fake College Football (FCFB) is a play-by-play college football simulation league. Follow live games, conference standings, national rankings, and team stats.' },
    { path: '/standings', title: 'Standings | FCFB', description: 'Live conference and league standings for every Fake College Football conference, updated weekly as the season progresses.' },
    { path: '/rankings', title: 'Rankings | FCFB', description: 'Weekly national rankings for every team in the Fake College Football simulation league.' },
    { path: '/scoreboard', title: 'Scoreboard | FCFB', description: 'Live and final scores for every Fake College Football game, including ongoing games, completed matchups, and scrimmages.' },
    { path: '/teams', title: 'Teams | FCFB', description: 'Browse every team in the Fake College Football league, filter by conference, and view team pages and rosters.' },
    { path: '/coaches', title: 'Coaches | FCFB', description: 'Every coach in the Fake College Football league, their current team, record, and status: active, free agent, or retired.' },
    { path: '/schedules', title: 'Schedules | FCFB', description: 'Full season and postseason schedules for every Fake College Football team and conference.' },
    { path: '/records', title: 'Records | FCFB', description: 'All-time and single-season records across the Fake College Football league, from top offenses to record-breaking performances.' },
    { path: '/graphs', title: 'Graphs | FCFB', description: 'Interactive graphs visualizing ELO history, ranking movement, and statistical trends across Fake College Football.' },
];

export const ROUTE_META = Object.fromEntries(routeList.map(route => [route.path, route]));
