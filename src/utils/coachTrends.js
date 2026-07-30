const coachOnSide = (coaches, names) => (coaches || []).some((coach) => names.includes(coach));

export const teamCoachPoints = (teamName, rankGames, eloRows, names) => {
    const coachGameIds = new Set();
    const rankPts = [];

    (rankGames || []).forEach((game) => {
        const isHome = game.home_team === teamName && coachOnSide(game.home_coaches, names);
        const isAway = game.away_team === teamName && coachOnSide(game.away_coaches, names);
        if (!isHome && !isAway) return;
        coachGameIds.add(game.game_id);
        const rank = isHome ? game.home_team_rank : game.away_team_rank;
        if (game.season != null && game.week != null) {
            rankPts.push({ season: game.season, week: game.week, gameId: game.game_id, value: rank });
        }
    });

    const eloPts = (eloRows || [])
        .filter((row) => row.elo != null && coachGameIds.has(row.game_id) && row.season != null && row.week != null)
        .map((row) => ({ season: row.season, week: row.week, gameId: row.game_id, value: Math.round(row.elo) }));

    return { rankPts, eloPts };
};

export const trendSeasons = (seriesByTeam) => {
    const seasons = new Set();
    Object.values(seriesByTeam).forEach(({ rankPts, eloPts }) => {
        [...rankPts, ...eloPts].forEach((point) => {
            if (point.season >= 1) seasons.add(point.season);
        });
    });
    return [...seasons].sort((a, b) => b - a);
};

export const buildTrendLines = ({ seriesByTeam, metric, seasonView, colorFor }) => {
    const isRank = metric === 'rank';
    return Object.entries(seriesByTeam)
        .map(([team, series]) => {
            let points = (isRank ? series.rankPts : series.eloPts).filter((point) => point.season >= 1);
            if (isRank) points = points.filter((point) => point.value >= 1 && point.value <= 25 && point.week <= 14);
            if (seasonView !== 'alltime') points = points.filter((point) => point.season === seasonView);
            points = points.slice().sort((a, b) => (a.season - b.season) || (a.week - b.week));
            return { team, points };
        })
        .filter((line) => line.points.length > 0)
        .map((line) => ({
            team: line.team,
            color: colorFor(line.team),
            pts: line.points.map((point) => ({
                x: seasonView === 'alltime' ? point.season * 100 + point.week : point.week,
                week: point.week,
                season: point.season,
                val: point.value,
            })),
        }));
};

export const trendBounds = (lines, pad) => {
    const vals = lines.flatMap((line) => line.pts.map((point) => point.val));
    if (vals.length === 0) return { yMin: 0, yMax: 1 };
    return { yMin: Math.min(...vals) - pad, yMax: Math.max(...vals) + pad };
};
