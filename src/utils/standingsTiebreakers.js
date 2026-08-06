const CONFERENCE_GAME = 'CONFERENCE_GAME';

const confPct = (row) => (row.confWins + row.confLosses > 0 ? row.confWins / (row.confWins + row.confLosses) : 0);

const gameWinner = (game) => {
    if (!game.finished || game.home_score == null || game.away_score == null) return null;
    if (game.home_score === game.away_score) return null;
    return game.home_score > game.away_score ? game.home_team : game.away_team;
};

const recordInGames = (teamName, games) => {
    let wins = 0;
    let losses = 0;
    games.forEach((game) => {
        const winner = gameWinner(game);
        if (!winner) return;
        if (winner === teamName) wins += 1;
        else if (game.home_team === teamName || game.away_team === teamName) losses += 1;
    });
    return { wins, losses };
};

const winPct = ({ wins, losses }) => (wins + losses > 0 ? wins / (wins + losses) : null);

const bucketByScore = (teams, scoreFn) => {
    const scores = teams.map(scoreFn);
    if (scores.some((score) => score == null)) return [teams];
    const distinct = [...new Set(scores)].sort((a, b) => b - a);
    if (distinct.length <= 1) return [teams];
    return distinct.map((score) => teams.filter((_, i) => scores[i] === score));
};

const headToHeadStep = (teams, games) => {
    const names = new Set(teams.map((team) => team.name));
    const conferenceGames = games.filter((g) => g.game_type === CONFERENCE_GAME && names.has(g.home_team) && names.has(g.away_team));
    return bucketByScore(teams, (team) => winPct(recordInGames(team.name, conferenceGames)));
};

const opponentsOf = (teamName, conferenceGames) => {
    const opponents = new Set();
    conferenceGames.forEach((g) => {
        if (g.home_team === teamName) opponents.add(g.away_team);
        if (g.away_team === teamName) opponents.add(g.home_team);
    });
    return opponents;
};

const commonOpponentsStep = (teams, games) => {
    const conferenceGames = games.filter((g) => g.game_type === CONFERENCE_GAME);
    const perTeamOpponents = teams.map((team) => opponentsOf(team.name, conferenceGames));
    const common = perTeamOpponents.slice(1).reduce(
        (acc, opponents) => new Set([...acc].filter((opp) => opponents.has(opp))),
        perTeamOpponents[0] || new Set(),
    );
    if (common.size === 0) return [teams];

    return bucketByScore(teams, (team) => {
        const gamesVsCommon = conferenceGames.filter((g) => {
            if (g.home_team !== team.name && g.away_team !== team.name) return false;
            const opponent = g.home_team === team.name ? g.away_team : g.home_team;
            return common.has(opponent);
        });
        return winPct(recordInGames(team.name, gamesVsCommon));
    });
};

const divisionRecordStep = (teams, games, divisionOf) => {
    if (teams.some((team) => !team.division)) return [teams];
    if (new Set(teams.map((team) => team.division)).size !== 1) return [teams];

    const conferenceGames = games.filter((g) => g.game_type === CONFERENCE_GAME);
    return bucketByScore(teams, (team) => {
        const divisionGames = conferenceGames.filter((g) => {
            if (g.home_team !== team.name && g.away_team !== team.name) return false;
            const opponent = g.home_team === team.name ? g.away_team : g.home_team;
            return divisionOf[opponent] === team.division;
        });
        return winPct(recordInGames(team.name, divisionGames));
    });
};

const overallPctStep = (teams) => bucketByScore(teams, (team) => winPct({ wins: team.wins, losses: team.losses }));

const TIEBREAKER_STEPS = [headToHeadStep, commonOpponentsStep, divisionRecordStep, overallPctStep];

/**
 * Recursively narrows a group of teams tied in conference record using the
 * generic step sequence. Each step either fully/partially separates the group
 * into ordered sub-buckets (re-run through the whole sequence, since a
 * sub-bucket that's still tied needs fresh comparisons scoped to just its
 * members) or leaves it untouched, in which case the next step is tried.
 * Falls back to alphabetical if nothing ever separates the group.
 */
const breakTies = (teams, games, divisionOf) => {
    if (teams.length <= 1) return teams;
    for (const step of TIEBREAKER_STEPS) {
        const buckets = step(teams, games, divisionOf);
        if (buckets.length > 1) {
            return buckets.flatMap((bucket) => breakTies(bucket, games, divisionOf));
        }
    }
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Sorts standings rows by conference win percentage, breaking ties with a
 * generic approximation of real college-football tiebreaker procedures:
 * head-to-head, common conference opponents, division record (only when
 * every tied team shares a division), then overall win percentage, with
 * alphabetical as the final deterministic fallback.
 */
export const sortStandingsRows = (rows, games = []) => {
    const divisionOf = Object.fromEntries(rows.map((row) => [row.name, row.division || null]));
    const byPct = [...rows].sort((a, b) => confPct(b) - confPct(a) || a.name.localeCompare(b.name));

    const result = [];
    let i = 0;
    while (i < byPct.length) {
        let j = i + 1;
        while (j < byPct.length && confPct(byPct[j]) === confPct(byPct[i])) j += 1;
        result.push(...breakTies(byPct.slice(i, j), games, divisionOf));
        i = j;
    }
    return result;
};
