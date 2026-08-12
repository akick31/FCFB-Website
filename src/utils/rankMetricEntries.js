export const rankMetricEntries = (entries, higherIsBetter) => {
    const sorted = [...entries].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
    const rankByTeamId = {};
    sorted.forEach((entry, index) => { rankByTeamId[entry.teamId] = index + 1; });
    return { sorted, rankByTeamId };
};
