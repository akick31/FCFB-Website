const bucket = (week) => (week > 13 ? 14 : week);

export const eloWeekBuckets = (eloHistory, season) => {
    const weeks = new Set();
    for (const row of eloHistory) {
        if (row.season !== season || row.week == null) continue;
        weeks.add(bucket(row.week));
    }
    return [...weeks].sort((a, b) => a - b);
};

export const eloByTeamForWeek = (eloHistory, season, weekBucket) => {
    const latest = new Map();
    for (const row of eloHistory) {
        if (row.season !== season || row.week == null || row.elo == null) continue;
        if (bucket(row.week) > weekBucket) continue;
        const prior = latest.get(row.team);
        if (!prior || row.week >= prior.week) latest.set(row.team, { week: row.week, elo: row.elo });
    }
    const eloByTeam = {};
    for (const [team, value] of latest) eloByTeam[team] = value.elo;
    return eloByTeam;
};

export const eloRankingForWeek = (eloHistory, season, weekBucket) => {
    const stats = new Map();
    for (const row of eloHistory) {
        if (row.season !== season || row.week == null) continue;
        const rowBucket = bucket(row.week);
        if (rowBucket > weekBucket) continue;
        let entry = stats.get(row.team);
        if (!entry) { entry = { week: -1, elo: null, wins: 0, losses: 0 }; stats.set(row.team, entry); }
        if (rowBucket < weekBucket) {
            if (row.result === 'W') entry.wins += 1;
            else if (row.result === 'L') entry.losses += 1;
        }
        if (row.elo != null && row.week >= entry.week) { entry.week = row.week; entry.elo = row.elo; }
    }
    const ordered = [...stats.entries()]
        .filter(([, entry]) => entry.elo != null)
        .map(([team, entry]) => ({ team, elo: entry.elo, wins: entry.wins, losses: entry.losses }))
        .sort((a, b) => b.elo - a.elo)
        .slice(0, 25)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    const rankByTeam = {};
    ordered.forEach((entry) => { rankByTeam[entry.team] = entry.rank; });
    return { ordered, rankByTeam };
};
