import http from 'node:http';

const PORT = process.env.OG_META_PORT || 8686;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://172.17.0.1:1212/api/v1/arceus';
const WEBSITE_SERVICE_KEY = process.env.WEBSITE_SERVICE_KEY || '';
const SITE_URL = process.env.SITE_URL || 'https://fakecollegefootball.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;

// Keep in sync with src/routeMeta.js: this service is a standalone container
// and can't import from src/ at runtime, so the static route list is duplicated here.
const STATIC_ROUTES = [
    { path: '/', title: 'Home | FCFB', description: 'Fake College Football (FCFB) is a play-by-play college football simulation league. Follow live games, conference standings, national rankings, and team stats.' },
    { path: '/standings', title: 'Standings | FCFB', description: 'Live conference and league standings for every Fake College Football conference, updated weekly as the season progresses.' },
    { path: '/rankings', title: 'Rankings | FCFB', description: 'Weekly national rankings for every team in the Fake College Football simulation league.' },
    { path: '/scoreboard', title: 'Scoreboard | FCFB', description: 'Live and final scores for every Fake College Football game, including ongoing games, completed matchups, and scrimmages.' },
    { path: '/teams', title: 'Teams | FCFB', description: 'Browse every team in the Fake College Football league, filter by conference, and view team pages and rosters.' },
    { path: '/coaches', title: 'Coaches | FCFB', description: 'Every coach in the Fake College Football league, their current team, record, and status: active, free agent, or retired.' },
    { path: '/schedules', title: 'Schedules | FCFB', description: 'Full season and postseason schedules for every Fake College Football team and conference.' },
    { path: '/records', title: 'Records | FCFB', description: 'All-time and single-season records across the Fake College Football league, from top offenses to record-breaking performances.' },
    { path: '/graphs', title: 'Graphs | FCFB', description: 'Interactive graphs visualizing ELO history, ranking movement, and statistical trends across Fake College Football.' },
    { path: '/rice-sheet', title: 'Rice Sheet | FCFB', description: 'Compare up to 10 Fake College Football teams side by side across ratings, records, and strength of schedule.' },
];

const HOME_ROUTE = STATIC_ROUTES[0];

const resolveStaticRoute = (pathname) => {
    const exact = STATIC_ROUTES.find((route) => route.path === pathname);
    if (exact) return exact;
    const prefixMatches = STATIC_ROUTES.filter((route) => route.path !== '/' && pathname.startsWith(`${route.path}/`));
    if (prefixMatches.length === 0) return null;
    return prefixMatches.sort((a, b) => b.path.length - a.path.length)[0];
};

const backendGet = async (path, params) => {
    const url = new URL(`${BACKEND_BASE_URL}${path}`);
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value != null) url.searchParams.set(key, value);
    });
    const response = await fetch(url, { headers: { 'X-Service-Key': WEBSITE_SERVICE_KEY } });
    if (!response.ok) throw new Error(`Backend request failed: ${response.status}`);
    return response.json();
};

const gameMeta = async (gameId) => {
    try {
        const game = await backendGet('/game/ongoing', { id: gameId });
        const away = game.away_team;
        const home = game.home_team;
        const isFinal = game.game_status === 'FINAL';
        const title = isFinal
            ? `${away} ${game.away_score} - ${game.home_score} ${home} | FCFB`
            : `${away} at ${home} | FCFB`;
        return {
            title,
            description: `Box score, win probability, and play-by-play for ${away} at ${home}.`,
        };
    } catch (err) {
        return { title: 'Game Details | FCFB', description: 'Game details in Fake College Football.' };
    }
};

const teamMeta = async (teamId) => {
    try {
        const team = await backendGet('/team', { teamId });
        return {
            title: `${team.name} | FCFB`,
            description: `Record, stats, schedule, and ELO history for ${team.name}.`,
            image: team.logo || DEFAULT_IMAGE,
        };
    } catch (err) {
        return { title: 'Team Details | FCFB', description: 'Team details in Fake College Football.' };
    }
};

const userMeta = async (coachName) => {
    try {
        const users = await backendGet('/user/all');
        const match = (Array.isArray(users) ? users : []).find((u) => u.username === coachName);
        const name = match ? match.username : coachName;
        return {
            title: `${name} | Fake College Football`,
            description: `Coach profile, record, and coaching history for ${name} in Fake College Football.`,
        };
    } catch (err) {
        return { title: `${coachName || 'Coach'} | Fake College Football`, description: `Coach profile, record, and coaching history for ${coachName || 'this coach'} in Fake College Football.` };
    }
};

const resolveMeta = async (pathname) => {
    let match;
    if ((match = pathname.match(/^\/game-details\/([^/]+)\/?$/))) {
        return gameMeta(decodeURIComponent(match[1]));
    }
    if ((match = pathname.match(/^\/team(?:-details)?\/([^/]+)\/?$/))) {
        return teamMeta(decodeURIComponent(match[1]));
    }
    if ((match = pathname.match(/^\/user-details\/([^/]+)\/?$/))) {
        return userMeta(decodeURIComponent(match[1]));
    }
    const staticRoute = resolveStaticRoute(pathname);
    if (staticRoute) return { title: staticRoute.title, description: staticRoute.description };
    return { title: HOME_ROUTE.title, description: HOME_ROUTE.description };
};

const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const renderHtml = ({ title, description, image, path }) => {
    const url = `${SITE_URL}${path}`;
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeImage = escapeHtml(image || DEFAULT_IMAGE);
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="FCFB" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${safeImage}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
</head>
<body>
    <p><a href="${escapeHtml(url)}">${safeTitle}</a></p>
</body>
</html>
`;
};

const server = http.createServer(async (req, res) => {
    try {
        const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const meta = await resolveMeta(pathname);
        const html = renderHtml({ ...meta, path: pathname });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    } catch (err) {
        console.error('og-meta error:', err);
        const html = renderHtml({ title: HOME_ROUTE.title, description: HOME_ROUTE.description, path: '/' });
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
    }
});

server.listen(PORT, () => {
    console.log(`og-meta service listening on port ${PORT}`);
});
