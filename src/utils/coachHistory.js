const SHORT_STINT_MS = 14 * 24 * 60 * 60 * 1000;

const matchesCoach = (entry, names, discordId) => {
    if (discordId) {
        const discordIds = Array.isArray(entry.coach_discord_ids) ? entry.coach_discord_ids : [entry.coach_discord_ids];
        if (discordIds.includes(discordId)) return true;
    }
    const coaches = Array.isArray(entry.coach) ? entry.coach : [entry.coach];
    return coaches.some((coach) => names.includes(coach));
};

const timeOf = (dateStr) => {
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export const coachTransactionsFor = (transactions, names, discordId) =>
    (transactions || [])
        .filter((entry) => matchesCoach(entry, names, discordId))
        .sort((a, b) => timeOf(b.transaction_date) - timeOf(a.transaction_date));

export const buildCoachStints = (transactions, currentTeam) => {
    const sorted = [...transactions].sort((a, b) => timeOf(a.transaction_date) - timeOf(b.transaction_date));
    const stints = [];
    const open = {};

    sorted.forEach((entry) => {
        const team = entry.team;
        const type = (entry.transaction || '').toUpperCase();
        const position = entry.position || 'HEAD_COACH';
        const date = entry.transaction_date || '';

        if (type === 'HIRED' || type === 'HIRED_INTERIM') {
            open[team] = { team, position, startDate: date };
        } else if (type === 'FIRED' && open[team]) {
            stints.push({ ...open[team], endDate: date });
            delete open[team];
        }
    });

    Object.values(open).forEach((stint) => stints.push({ ...stint, endDate: null }));

    if (currentTeam?.team && !stints.some((stint) => stint.team === currentTeam.team && !stint.endDate)) {
        stints.push({ team: currentTeam.team, position: currentTeam.position || 'HEAD_COACH', startDate: null, endDate: null });
    }

    return stints
        .filter((stint) => !stint.endDate || (timeOf(stint.endDate) - timeOf(stint.startDate)) >= SHORT_STINT_MS)
        .sort((a, b) => {
            const activeDiff = (b.endDate ? 0 : 1) - (a.endDate ? 0 : 1);
            return activeDiff !== 0 ? activeDiff : timeOf(b.startDate) - timeOf(a.startDate);
        });
};

export const buildTeamCoachHistory = (transactions, teamName, discordIdToUsername) => {
    const teamEntries = (transactions || []).filter((entry) => entry.team === teamName);
    const sorted = [...teamEntries].sort((a, b) => timeOf(a.transaction_date) - timeOf(b.transaction_date));
    const stints = [];
    const open = {};

    sorted.forEach((entry) => {
        const type = (entry.transaction || '').toUpperCase();
        const position = entry.position || 'HEAD_COACH';
        const date = entry.transaction_date || '';
        const coaches = Array.isArray(entry.coach) ? entry.coach : [entry.coach];
        const coachDiscordIds = Array.isArray(entry.coach_discord_ids) ? entry.coach_discord_ids : [entry.coach_discord_ids];
        const coachDiscordId = coachDiscordIds.filter(Boolean)[0] || null;
        const loggedCoach = coaches.filter(Boolean)[0] || null;
        const coach = (coachDiscordId && discordIdToUsername?.[coachDiscordId]) || loggedCoach;
        if (!coach) return;

        if (type === 'HIRED' || type === 'HIRED_INTERIM') {
            open[position] = { coach, coachDiscordId, position, startDate: date };
        } else if (type === 'FIRED' && open[position]) {
            stints.push({ ...open[position], endDate: date });
            delete open[position];
        }
    });

    Object.values(open).forEach((stint) => stints.push({ ...stint, endDate: null }));

    return stints
        .filter((stint) => !stint.endDate || (timeOf(stint.endDate) - timeOf(stint.startDate)) >= SHORT_STINT_MS)
        .sort((a, b) => {
            const activeDiff = (b.endDate ? 0 : 1) - (a.endDate ? 0 : 1);
            return activeDiff !== 0 ? activeDiff : timeOf(b.startDate) - timeOf(a.startDate);
        });
};

export const currentRosterByTeam = (transactions) => {
    const sorted = [...transactions].sort((a, b) => timeOf(a.transaction_date) - timeOf(b.transaction_date));
    const roster = {};

    sorted.forEach((entry) => {
        const team = entry.team;
        const type = (entry.transaction || '').toUpperCase();
        const position = entry.position || 'HEAD_COACH';
        const coaches = Array.isArray(entry.coach) ? entry.coach : [entry.coach];
        if (!roster[team]) roster[team] = {};

        if (type === 'HIRED' || type === 'HIRED_INTERIM') {
            coaches.forEach((username) => { roster[team][username] = { position }; });
        } else if (type === 'FIRED') {
            coaches.forEach((username) => { delete roster[team][username]; });
        }
    });

    return roster;
};

export const formatStintDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
