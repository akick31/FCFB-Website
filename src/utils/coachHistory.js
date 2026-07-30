const SHORT_STINT_MS = 14 * 24 * 60 * 60 * 1000;

const matchesCoach = (entry, names) => {
    const coaches = Array.isArray(entry.coach) ? entry.coach : [entry.coach];
    return coaches.some((coach) => names.includes(coach));
};

const timeOf = (dateStr) => {
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

export const coachTransactionsFor = (transactions, names) =>
    (transactions || [])
        .filter((entry) => matchesCoach(entry, names))
        .sort((a, b) => timeOf(b.transaction_date) - timeOf(a.transaction_date));

export const buildCoachStints = (transactions) => {
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
    return stints
        .filter((stint) => !stint.endDate || (timeOf(stint.endDate) - timeOf(stint.startDate)) >= SHORT_STINT_MS)
        .sort((a, b) => timeOf(b.startDate) - timeOf(a.startDate));
};

export const formatStintDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
