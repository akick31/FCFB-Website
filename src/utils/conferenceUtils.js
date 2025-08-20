/**
 * Conference formatting utilities for consistent display across the application
 */

// Conference name mapping for proper display formatting
const CONFERENCE_MAPPINGS = {
    // Power 5 Conferences
    'BIG_12': 'Big 12',
    'SEC': 'SEC',
    'ACC': 'ACC',
    'PAC_12': 'Pac-12',
    'BIG_TEN': 'Big Ten',
    
    // Group of 5 Conferences
    'AAC': 'American',
    'CUSA': 'Conference USA',
    'MAC': 'MAC',
    'MWC': 'Mountain West',
    'SUN_BELT': 'Sun Belt',
    
    // FCS Conferences
    'SOUTHLAND': 'Southland',
    'MISSOURI_VALLEY': 'Missouri Valley',
    'BIG_SKY': 'Big Sky',
    'COLONIAL': 'Colonial',
    'OHIO_VALLEY': 'Ohio Valley',
    'PATRIOT': 'Patriot League',
    'NORTHEAST': 'Northeast',
    'PIONEER': 'Pioneer League',
    'IVY': 'Ivy League',
    
    // Other Conferences
    'INDEPENDENT': 'Independent',
    'FCS_INDEPENDENT': 'FCS Independent',
    'D2': 'Division II',
    'D3': 'Division III',
    'NAIA': 'NAIA'
};

/**
 * Formats a conference name from backend format to display format
 * @param {string} conference - The conference name from backend (e.g., "BIG_12")
 * @returns {string} - Formatted conference name (e.g., "Big 12")
 */
export const formatConferenceName = (conference) => {
    if (!conference) return 'Independent';
    
    // Check if we have a direct mapping
    if (CONFERENCE_MAPPINGS[conference]) {
        return CONFERENCE_MAPPINGS[conference];
    }
    
    // Fallback formatting for unmapped conferences
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

/**
 * Gets all unique conferences from a list of teams
 * @param {Array} teams - Array of team objects
 * @returns {Array} - Sorted array of unique conference names
 */
export const getUniqueConferences = (teams) => {
    return [...new Set(teams.map(team => team.conference).filter(Boolean))].sort();
}; 