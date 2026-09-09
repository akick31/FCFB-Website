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
    { path: '/stats', title: 'Stats | FCFB', description: 'League leaderboards, records, and conference and playbook statistics in Fake College Football.' },
    { path: '/records', title: 'Records | FCFB', description: 'All-time and single-season records across the Fake College Football league, from top offenses to record-breaking performances.' },
    { path: '/graphs', title: 'Graphs | FCFB', description: 'Interactive graphs visualizing ELO history, ranking movement, and statistical trends across Fake College Football.' },
    { path: '/rice-sheet', title: 'Rice Sheet | FCFB', description: 'Compare up to 25 Fake College Football teams side by side across ratings, records, and strength of schedule.' },
    { path: '/developers', title: 'API docs | Fake College Football', description: 'Browse the FCFB API and try requests live.' },
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

const findUserByDiscordId = async (discordId) => {
    const users = await backendGet('/user/all');
    return (Array.isArray(users) ? users : []).find((u) => u.discord_id === discordId) || null;
};

const usernameForDiscordId = async (discordId) => {
    if (!discordId) return null;
    try {
        const user = await findUserByDiscordId(discordId);
        return user?.username || null;
    } catch (err) {
        return null;
    }
};

const SIDE_LABELS = { OFFENSE: 'offense', DEFENSE: 'defense', SPECIAL_TEAMS: 'special teams' };
const DOWN_LABELS = { 1: '1st down', 2: '2nd down', 3: '3rd down', 4: '4th down' };
const FIELD_POSITION_LABELS = { OWN_TERRITORY: 'own territory', OPPONENT_TERRITORY: 'opponent territory', RED_ZONE: 'red zone' };
const PLAY_TYPE_LABELS = { RUN: 'run', PASS: 'pass', PAT: 'PAT', PUNT: 'punt', FIELD_GOAL: 'field goal', KICKOFF_NORMAL: 'kickoff', KICKOFF_ONSIDE: 'onside kick', KICKOFF_SQUIB: 'squib kick' };
const TEMPO_LABELS = { CHEW: 'chew tempo', HURRY: 'hurry tempo' };

const splitParam = (value) => (value ? value.split(',').filter(Boolean) : []);

const describeScoutingFilters = (searchParams) => {
    const parts = [];
    const sides = splitParam(searchParams.get('sides')).map((v) => SIDE_LABELS[v.toUpperCase()] || v.toLowerCase());
    if (sides.length) parts.push(`side: ${sides.join(', ')}`);
    const downs = splitParam(searchParams.get('downs')).map((v) => DOWN_LABELS[v] || `${v} down`);
    if (downs.length) parts.push(`down: ${downs.join(', ')}`);
    const fieldPositions = splitParam(searchParams.get('fp')).map((v) => FIELD_POSITION_LABELS[v.toUpperCase()] || v.toLowerCase());
    if (fieldPositions.length) parts.push(`field position: ${fieldPositions.join(', ')}`);
    const playTypes = splitParam(searchParams.get('types')).map((v) => PLAY_TYPE_LABELS[v.toUpperCase()] || v.toLowerCase());
    if (playTypes.length) parts.push(`play type: ${playTypes.join(', ')}`);
    const tempo = splitParam(searchParams.get('tempo')).map((v) => TEMPO_LABELS[v.toUpperCase()] || v.toLowerCase());
    if (tempo.length) parts.push(`tempo: ${tempo.join(', ')}`);
    return parts.join(', ');
};

const scoutingReportMeta = async (searchParams) => {
    const coachName = await usernameForDiscordId(searchParams.get('coach'));
    if (!coachName) {
        return { title: 'Scouting Report | FCFB', description: 'Pull every play for a coach in Fake College Football and filter by down, field position, play type, and tempo.' };
    }
    const isSeasonScoped = searchParams.get('season') === '1';
    const games = searchParams.get('games');
    const scope = isSeasonScoped ? 'the current season' : `the last ${games || 10} games`;
    const filters = describeScoutingFilters(searchParams);
    return {
        title: `Scouting Report: ${coachName} | FCFB`,
        description: `Play by play scouting report for ${coachName}, covering ${scope}${filters ? `, filtered by ${filters}` : ''}.`,
    };
};

const matchupPreviewMeta = (searchParams) => {
    const teamA = searchParams.get('teamA');
    const teamB = searchParams.get('teamB');
    if (!teamA || !teamB) {
        return { title: 'Matchup Previewer | FCFB', description: 'Compare two teams in Fake College Football: head to head history, tendencies, and projected spread.' };
    }
    return {
        title: `${teamA} vs ${teamB} | FCFB`,
        description: `Head to head history, tendencies, and projected spread for ${teamA} versus ${teamB} in Fake College Football.`,
    };
};

const coachTendenciesMeta = async (searchParams) => {
    const coachName = await usernameForDiscordId(searchParams.get('coach'));
    if (!coachName) {
        return { title: 'Coach Tendency Card | FCFB', description: 'Auto generated play calling tendencies for a coach in Fake College Football.' };
    }
    return {
        title: `${coachName} Tendency Card | FCFB`,
        description: `Play calling tendencies for ${coachName} in Fake College Football, including down and distance splits, fourth down rate, and tempo.`,
    };
};

const driveChartMeta = async (searchParams) => {
    const gameId = searchParams.get('game');
    if (gameId) {
        try {
            const game = await backendGet('/game/ongoing', { id: gameId });
            return {
                title: `Drive Chart: ${game.away_team} at ${game.home_team} | FCFB`,
                description: `Drive by drive replay and field chart for ${game.away_team} at ${game.home_team} in Fake College Football.`,
            };
        } catch (err) {
            // fall through to the generic tool description below
        }
    }
    return { title: 'Drive Chart and Replay | FCFB', description: 'Drive by drive replay and field chart for any Fake College Football game.' };
};

const resolveEntityName = async (type, id) => {
    if (!id) return null;
    return type === 'coach' ? usernameForDiscordId(id) : id;
};

const headToHeadMeta = async (searchParams) => {
    const aType = searchParams.get('aType') === 'coach' ? 'coach' : 'team';
    const bType = searchParams.get('bType') === 'coach' ? 'coach' : 'team';
    const [nameA, nameB] = await Promise.all([
        resolveEntityName(aType, searchParams.get('a')),
        resolveEntityName(bType, searchParams.get('b')),
    ]);
    if (!nameA || !nameB) {
        return { title: 'Winsipedia | FCFB', description: 'Winsipedia style standings and head to head history for teams and coaches in Fake College Football.' };
    }
    return {
        title: `${nameA} vs ${nameB} | Winsipedia | FCFB`,
        description: `All time standings and head to head history between ${nameA} and ${nameB} in Fake College Football.`,
    };
};

const resolveMeta = async (url) => {
    const { pathname, searchParams } = url;
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
    if (pathname === '/tools/scouting-report') return scoutingReportMeta(searchParams);
    if (pathname === '/tools/matchup-preview') return matchupPreviewMeta(searchParams);
    if (pathname === '/tools/coach-tendencies') return coachTendenciesMeta(searchParams);
    if (pathname === '/tools/drive-chart') return driveChartMeta(searchParams);
    if (pathname === '/tools/head-to-head') return headToHeadMeta(searchParams);
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
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const meta = await resolveMeta(url);
        const html = renderHtml({ ...meta, path: `${url.pathname}${url.search}` });
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
