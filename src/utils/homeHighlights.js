const UNRANKED = 99;

const rankOf = (rank) => (rank >= 1 && rank <= 25 ? rank : UNRANKED);

const bothRanked = (homeRank, awayRank) => rankOf(homeRank) < UNRANKED && rankOf(awayRank) < UNRANKED;

const margin = (game) => Math.abs((game.home_score || 0) - (game.away_score || 0));

export const marqueeGames = ({ live, finals, upcoming, rankByTeam, limit = 6 }) => {
    const rankedLive = live.filter((game) => bothRanked(game.home_team_rank, game.away_team_rank));
    const rankedUpcoming = upcoming
        .map((game) => ({
            ...game,
            home_team_rank: rankByTeam[game.home_team],
            away_team_rank: rankByTeam[game.away_team],
            upcoming: true,
        }))
        .filter((game) => bothRanked(game.home_team_rank, game.away_team_rank));
    const rankedFinals = finals.filter((game) => bothRanked(game.home_team_rank, game.away_team_rank));
    const ranked = [...rankedLive, ...rankedUpcoming, ...rankedFinals];
    if (ranked.length > 0) {
        return { kind: 'ranked', games: ranked.slice(0, limit) };
    }
    return { kind: 'close', games: [...live].sort((a, b) => margin(a) - margin(b)).slice(0, limit) };
};

export const rankMovers = (rows, limit = Infinity) => {
    const hasPrevious = rows.some((row) => row.prev != null);
    const moves = rows.map((row) => ({
        team: row.team,
        value: row.rank,
        change: row.prev != null ? row.prev - row.rank : null,
    }));
    const moved = moves.filter((move) => move.change != null && move.change !== 0);
    return {
        risers: moved
            .filter((move) => move.change > 0)
            .sort((a, b) => b.change - a.change || a.value - b.value)
            .slice(0, limit),
        fallers: moved
            .filter((move) => move.change < 0)
            .sort((a, b) => a.change - b.change || a.value - b.value)
            .slice(0, limit),
        newcomers: hasPrevious ? moves.filter((move) => move.change == null).slice(0, limit) : [],
    };
};

export const pollMovers = (current, previous, limit = 5) => {
    const before = Object.fromEntries(previous.map((row) => [row.teamName, row.rank]));
    return rankMovers(
        current.map((row) => ({ team: row.teamName, rank: row.rank, prev: before[row.teamName] })),
        limit
    );
};

export const eloMovers = (rows, week, limit = 5) => {
    const byTeam = {};
    rows.forEach((row) => {
        (byTeam[row.team] = byTeam[row.team] || []).push(row);
    });
    const moves = Object.entries(byTeam)
        .map(([team, teamRows]) => {
            const sorted = [...teamRows].sort((a, b) => a.week - b.week);
            const latestIndex = sorted.map((row) => row.week).lastIndexOf(week);
            if (latestIndex < 1) {
                return null;
            }
            const latest = sorted[latestIndex];
            return {
                team,
                value: Math.round(latest.elo),
                change: Math.round(latest.elo - sorted[latestIndex - 1].elo),
            };
        })
        .filter((move) => move && move.change !== 0);
    return {
        risers: moves
            .filter((move) => move.change > 0)
            .sort((a, b) => b.change - a.change)
            .slice(0, limit),
        fallers: moves
            .filter((move) => move.change < 0)
            .sort((a, b) => a.change - b.change)
            .slice(0, limit),
    };
};
