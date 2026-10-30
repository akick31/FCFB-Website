export const finalScore = (game) =>
    game ? `${Math.max(game.home_score, game.away_score)}-${Math.min(game.home_score, game.away_score)}` : '';

export const gamesById = (games) => Object.fromEntries((games || []).map((game) => [game.game_id, game]));

export const withScores = (upsets, games) => {
    const byId = gamesById(games);
    return (upsets || []).map((upset) => ({ ...upset, score: finalScore(byId[upset.game_id]) }));
};

const bestRank = (game) => Math.min(game.home_rank || 99, game.away_rank || 99);

const isPostseason = (game) =>
    Boolean(game.postseason_name) ||
    ['BOWL', 'PLAYOFFS', 'NATIONAL_CHAMPIONSHIP', 'CONFERENCE_CHAMPIONSHIP'].includes(game.game_type);

export const sortHistoryGames = (games) =>
    [...games].sort(
        (a, b) =>
            Number(isPostseason(b)) - Number(isPostseason(a)) ||
            bestRank(a) - bestRank(b) ||
            a.home_team.localeCompare(b.home_team)
    );

export const filterHistoryGames = (games, filter, highlights) => {
    if (filter === 'ranked') {
        return games.filter((game) => game.home_rank || game.away_rank);
    }
    if (filter === 'upsets') {
        const upsetIds = new Set((highlights?.upsets || []).map((upset) => upset.game_id));
        return games.filter((game) => upsetIds.has(game.game_id));
    }
    if (filter === 'close') {
        return games.filter((game) => Math.abs(game.home_score - game.away_score) <= 7);
    }
    return games;
};

export const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours ? `${hours}h ${rest}m` : `${rest}m`;
};
