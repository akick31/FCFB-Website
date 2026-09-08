export const teamHeadToHead = (games, teamA, teamB) => {
    const matchups = (games || []).filter((game) => (game.home_team === teamA && game.away_team === teamB) || (game.home_team === teamB && game.away_team === teamA));
    let winsA = 0;
    let winsB = 0;
    let ties = 0;
    matchups.forEach((game) => {
        if (game.home_score == null || game.away_score == null) return;
        const aIsHome = game.home_team === teamA;
        const aScore = aIsHome ? game.home_score : game.away_score;
        const bScore = aIsHome ? game.away_score : game.home_score;
        if (aScore > bScore) winsA += 1;
        else if (bScore > aScore) winsB += 1;
        else ties += 1;
    });
    return { winsA, winsB, ties, games: matchups.length };
};

export const resolveCoachSide = (plays, gameId, discordId) => {
    const play = (plays || []).find((entry) => entry.game_id === gameId);
    if (!play) return null;
    if (play.offensive_submitter_id === discordId) return play.possession;
    if (play.defensive_submitter_id === discordId) return play.possession === 'HOME' ? 'AWAY' : 'HOME';
    return null;
};

export const coachHeadToHead = (playsA, playsB, discordA, discordB, gameMap) => {
    const gamesA = new Set(playsA.map((play) => play.game_id));
    const gamesB = new Set(playsB.map((play) => play.game_id));
    const shared = [...gamesA].filter((id) => gamesB.has(id));
    let winsA = 0;
    let winsB = 0;
    let ties = 0;
    let games = 0;
    shared.forEach((gameId) => {
        const game = gameMap[gameId];
        if (!game || game.home_score == null || game.away_score == null) return;
        const sideA = resolveCoachSide(playsA, gameId, discordA);
        const sideB = resolveCoachSide(playsB, gameId, discordB);
        if (!sideA || !sideB || sideA === sideB) return;
        games += 1;
        if (game.home_score === game.away_score) {
            ties += 1;
            return;
        }
        const homeWon = game.home_score > game.away_score;
        if ((sideA === 'HOME' && homeWon) || (sideA === 'AWAY' && !homeWon)) winsA += 1;
        else winsB += 1;
    });
    return { winsA, winsB, ties, games };
};

export const resolveHeadCoach = (users, teamName) => {
    const coaches = users.filter((user) => user.team === teamName && user.discord_id);
    return coaches.find((user) => user.position === 'HEAD_COACH') || coaches[0] || null;
};

const resolveEntitySide = (game, entity, plays) => {
    if (entity.mode === 'team') {
        if (game.home_team === entity.id) return 'HOME';
        if (game.away_team === entity.id) return 'AWAY';
        return null;
    }
    return resolveCoachSide(plays, game.game_id, entity.id);
};

export const buildMatchupHistory = (games, entityA, entityB, playsA, playsB) => (games || [])
    .filter((game) => game.home_score != null && game.away_score != null)
    .map((game) => {
        const sideA = resolveEntitySide(game, entityA, playsA);
        const sideB = resolveEntitySide(game, entityB, playsB);
        if (!sideA || !sideB || sideA === sideB) return null;
        const scoreA = sideA === 'HOME' ? game.home_score : game.away_score;
        const scoreB = sideB === 'HOME' ? game.home_score : game.away_score;
        let winner = null;
        if (scoreA > scoreB) winner = 'A';
        else if (scoreB > scoreA) winner = 'B';
        return { gameId: game.game_id, season: game.season, week: game.week, scoreA, scoreB, winner };
    })
    .filter(Boolean)
    .sort((a, b) => (a.season - b.season) || (a.week - b.week));

export const matchupCurrentStreak = (matchups) => {
    if (!matchups.length) return null;
    const last = matchups[matchups.length - 1];
    if (!last.winner) return null;
    let length = 0;
    let startSeason = last.season;
    for (let i = matchups.length - 1; i >= 0; i -= 1) {
        if (matchups[i].winner !== last.winner) break;
        length += 1;
        startSeason = matchups[i].season;
    }
    return { winner: last.winner, length, startSeason, endSeason: last.season };
};

export const matchupLongestStreak = (matchups, side) => {
    let best = { length: 0, startSeason: null, endSeason: null };
    let current = 0;
    let currentStart = null;
    matchups.forEach((matchup) => {
        if (matchup.winner === side) {
            if (current === 0) currentStart = matchup.season;
            current += 1;
            if (current > best.length) best = { length: current, startSeason: currentStart, endSeason: matchup.season };
        } else {
            current = 0;
            currentStart = null;
        }
    });
    return best;
};

export const matchupLargestMargin = (matchups, side) => {
    let best = null;
    matchups.forEach((matchup) => {
        if (matchup.winner !== side) return;
        const margin = Math.abs(matchup.scoreA - matchup.scoreB);
        if (!best || margin > best.margin) best = { margin, gameId: matchup.gameId, season: matchup.season, week: matchup.week };
    });
    return best;
};
