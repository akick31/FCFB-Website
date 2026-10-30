const conferenceRecord = (team) => {
    const wins = team.current_conference_wins || 0;
    const losses = team.current_conference_losses || 0;
    return { wins, rate: wins + losses > 0 ? wins / (wins + losses) : 0 };
};

const leads = (team, current) => {
    if (!current) {
        return true;
    }
    const challenger = conferenceRecord(team);
    const holder = conferenceRecord(current);
    return challenger.rate > holder.rate || (challenger.rate === holder.rate && challenger.wins > holder.wins);
};

export const conferenceLeaders = (teams, conferenceOrder) => {
    const leaders = {};
    teams.forEach((team) => {
        if (!team.conference) {
            return;
        }
        const key = `${team.conference}|${team.division || ''}`;
        if (leads(team, leaders[key]?.team)) {
            leaders[key] = { key, conference: team.conference, division: team.division || null, team };
        }
    });
    return conferenceOrder.flatMap((conference) =>
        Object.values(leaders)
            .filter((leader) => leader.conference === conference)
            .sort((a, b) => String(a.division || '').localeCompare(String(b.division || '')))
    );
};
