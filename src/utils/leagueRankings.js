export const ordinal = (n) => {
    if (n == null) return '-';
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
};

export const rankAmong = (items, valueFn, keyFn = (item) => item.name) => {
    const withValues = items.map((item) => ({ key: keyFn(item), value: valueFn(item) }));
    const sorted = [...withValues].sort((a, b) => {
        if (a.value == null && b.value == null) return 0;
        if (a.value == null) return 1;
        if (b.value == null) return -1;
        return b.value - a.value;
    });
    const result = new Map();
    let rank = 0;
    let seen = 0;
    let previousValue;
    sorted.forEach((entry) => {
        seen += 1;
        if (entry.value == null) {
            result.set(entry.key, { value: null, rank: null });
            return;
        }
        if (previousValue === undefined || entry.value !== previousValue) {
            rank = seen;
            previousValue = entry.value;
        }
        result.set(entry.key, { value: entry.value, rank });
    });
    return result;
};

export const computePollWeeks = (rankedGames, teamName) => {
    const weeks = new Set();
    const weeksAtOne = new Set();
    (rankedGames || []).forEach((game) => {
        const isHome = game.home_team === teamName;
        const isAway = game.away_team === teamName;
        if (!isHome && !isAway) return;
        const rank = isHome ? game.home_team_rank : game.away_team_rank;
        if (rank == null || rank < 1 || rank > 25) return;
        const key = `${game.season}-${game.week}`;
        weeks.add(key);
        if (rank === 1) weeksAtOne.add(key);
    });
    return { weeksRanked: weeks.size, weeksAtOne: weeksAtOne.size };
};

export const buildTeamRankings = (teams, rankedGames) => {
    const winPctRank = rankAmong(teams, (t) => ((t.overall_wins ?? 0) + (t.overall_losses ?? 0) > 0 ? (t.overall_wins ?? 0) / ((t.overall_wins ?? 0) + (t.overall_losses ?? 0)) : null));
    const natChampRank = rankAmong(teams, (t) => t.national_championship_wins ?? 0);
    const confChampRank = rankAmong(teams, (t) => t.conference_championship_wins ?? 0);
    const bowlGamesRank = rankAmong(teams, (t) => (t.bowl_wins ?? 0) + (t.bowl_losses ?? 0));
    const winsRank = rankAmong(teams, (t) => t.overall_wins ?? 0);
    const lossesRank = rankAmong(teams, (t) => t.overall_losses ?? 0);
    const bowlWinPctRank = rankAmong(teams, (t) => ((t.bowl_wins ?? 0) + (t.bowl_losses ?? 0) > 0 ? (t.bowl_wins ?? 0) / ((t.bowl_wins ?? 0) + (t.bowl_losses ?? 0)) : null));

    const pollByTeam = new Map(teams.map((t) => [t.name, computePollWeeks(rankedGames, t.name)]));
    const weeksRankedRank = rankAmong(teams, (t) => pollByTeam.get(t.name)?.weeksRanked ?? 0);
    const weeksAtOneRank = rankAmong(teams, (t) => pollByTeam.get(t.name)?.weeksAtOne ?? 0);

    const result = new Map();
    teams.forEach((team) => {
        result.set(team.name, {
            totalEntities: teams.length,
            winPct: winPctRank.get(team.name),
            record: { wins: team.overall_wins ?? 0, losses: team.overall_losses ?? 0 },
            nationalChampionships: natChampRank.get(team.name),
            conferenceChampionships: confChampRank.get(team.name),
            bowlGames: bowlGamesRank.get(team.name),
            wins: winsRank.get(team.name),
            losses: lossesRank.get(team.name),
            bowlWinPct: bowlWinPctRank.get(team.name),
            bowlRecord: { wins: team.bowl_wins ?? 0, losses: team.bowl_losses ?? 0 },
            weeksRanked: weeksRankedRank.get(team.name),
            weeksAtOne: weeksAtOneRank.get(team.name),
        });
    });
    return result;
};

export const computeCoachPollWeeks = (rankedGames, discordId) => {
    const weeks = new Set();
    const weeksAtOne = new Set();
    (rankedGames || []).forEach((game) => {
        const isHome = (game.home_coach_discord_ids || []).includes(discordId);
        const isAway = (game.away_coach_discord_ids || []).includes(discordId);
        if (!isHome && !isAway) return;
        const rank = isHome ? game.home_team_rank : game.away_team_rank;
        if (rank == null || rank < 1 || rank > 25) return;
        const key = `${game.season}-${game.week}`;
        weeks.add(key);
        if (rank === 1) weeksAtOne.add(key);
    });
    return { weeksRanked: weeks.size, weeksAtOne: weeksAtOne.size };
};

export const buildCoachRankings = (users, rankedGames) => {
    const coaches = (users || []).filter((user) => user.discord_id);
    const keyFn = (coach) => coach.discord_id;

    const winPctRank = rankAmong(coaches, (c) => ((c.wins ?? 0) + (c.losses ?? 0) > 0 ? (c.wins ?? 0) / ((c.wins ?? 0) + (c.losses ?? 0)) : null), keyFn);
    const natChampRank = rankAmong(coaches, (c) => c.national_championship_wins ?? 0, keyFn);
    const confChampRank = rankAmong(coaches, (c) => c.conference_championship_wins ?? 0, keyFn);
    const bowlGamesRank = rankAmong(coaches, (c) => (c.bowl_wins ?? 0) + (c.bowl_losses ?? 0), keyFn);
    const winsRank = rankAmong(coaches, (c) => c.wins ?? 0, keyFn);
    const lossesRank = rankAmong(coaches, (c) => c.losses ?? 0, keyFn);
    const bowlWinPctRank = rankAmong(coaches, (c) => ((c.bowl_wins ?? 0) + (c.bowl_losses ?? 0) > 0 ? (c.bowl_wins ?? 0) / ((c.bowl_wins ?? 0) + (c.bowl_losses ?? 0)) : null), keyFn);

    const pollByCoach = new Map(coaches.map((c) => [c.discord_id, computeCoachPollWeeks(rankedGames, c.discord_id)]));
    const weeksRankedRank = rankAmong(coaches, (c) => pollByCoach.get(c.discord_id)?.weeksRanked ?? 0, keyFn);
    const weeksAtOneRank = rankAmong(coaches, (c) => pollByCoach.get(c.discord_id)?.weeksAtOne ?? 0, keyFn);

    const result = new Map();
    coaches.forEach((coach) => {
        result.set(coach.discord_id, {
            totalEntities: coaches.length,
            winPct: winPctRank.get(coach.discord_id),
            record: { wins: coach.wins ?? 0, losses: coach.losses ?? 0 },
            nationalChampionships: natChampRank.get(coach.discord_id),
            conferenceChampionships: confChampRank.get(coach.discord_id),
            bowlGames: bowlGamesRank.get(coach.discord_id),
            wins: winsRank.get(coach.discord_id),
            losses: lossesRank.get(coach.discord_id),
            bowlWinPct: bowlWinPctRank.get(coach.discord_id),
            bowlRecord: { wins: coach.bowl_wins ?? 0, losses: coach.bowl_losses ?? 0 },
            weeksRanked: weeksRankedRank.get(coach.discord_id),
            weeksAtOne: weeksAtOneRank.get(coach.discord_id),
        });
    });
    return result;
};
