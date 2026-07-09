const CONFERENCE_MAPPINGS = {
    'BIG_12': 'Big 12',
    'SEC': 'SEC',
    'ACC': 'ACC',
    'PAC_12': 'Pac-12',
    'BIG_TEN': 'Big Ten',
    'AAC': 'American',
    'CUSA': 'Conference USA',
    'MAC': 'MAC',
    'MWC': 'Mountain West',
    'SUN_BELT': 'Sun Belt',
    'SOUTHLAND': 'Southland',
    'MISSOURI_VALLEY': 'Missouri Valley',
    'BIG_SKY': 'Big Sky',
    'COLONIAL': 'Colonial',
    'OHIO_VALLEY': 'Ohio Valley',
    'PATRIOT': 'Patriot League',
    'NORTHEAST': 'Northeast',
    'PIONEER': 'Pioneer League',
    'IVY': 'Ivy League',
    'INDEPENDENT': 'Independent',
    'FCS_INDEPENDENT': 'FCS Independent',
    'D2': 'Division II',
    'D3': 'Division III',
    'NAIA': 'NAIA'
};

export const formatConferenceName = (conference) => {
    if (!conference) return 'Independent';

    if (CONFERENCE_MAPPINGS[conference]) {
        return CONFERENCE_MAPPINGS[conference];
    }

    return conference
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/\b(Big|Sec|Acc|Pac|Aac|Cusa|Mac|Mwc|Sun|Wac|Southland|American|Conference|USA|Mountain|West|Atlantic|Coast|Pacific|Athletic|Association)\b/gi, (match) => {
            const abbreviations = {
                'BIG': 'Big',
                'SEC': 'SEC',
                'ACC': 'ACC',
                'PAC': 'Pac',
                'AAC': 'AAC',
                'CUSA': 'C-USA',
                'MAC': 'MAC',
                'MWC': 'MWC',
                'SUN': 'Sun Belt',
                'WAC': 'WAC',
                'SOUTHLAND': 'Southland',
                'AMERICAN': 'American',
                'CONFERENCE': 'Conference',
                'USA': 'USA',
                'MOUNTAIN': 'Mountain',
                'WEST': 'West',
                'ATLANTIC': 'Atlantic',
                'COAST': 'Coast',
                'PACIFIC': 'Pacific',
                'ATHLETIC': 'Athletic',
                'ASSOCIATION': 'Association'
            };
            return abbreviations[match.toUpperCase()] || match;
        });
};

export const getUniqueConferences = (teams) => {
    return [...new Set(teams.map(team => team.conference).filter(Boolean))].sort();
};
