const REGIONAL_PREFIXES = ['Central', 'Eastern', 'Western', 'Northern', 'Southern', 'North', 'South', 'East', 'West'];

export const shortTeamName = (name) => {
    if (!name) return name;
    const [first, ...rest] = name.split(' ');
    if (!rest.length || !REGIONAL_PREFIXES.includes(first)) return name;
    return `${first[0]} ${rest.join(' ')}`;
};
