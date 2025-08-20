/**
 * Team data utilities for consistent parsing and formatting across the application
 */

/**
 * Formats a team record from wins and losses
 * @param {number} wins - Number of wins
 * @param {number} losses - Number of losses
 * @returns {string} - Formatted record (e.g., "5-3")
 */
export const formatTeamRecord = (wins, losses) => {
    return `${wins || 0}-${losses || 0}`;
};

/**
 * Gets the count of available teams from a list
 * @param {Array} teams - Array of team objects
 * @returns {number} - Count of available teams
 */
export const getAvailableTeamsCount = (teams) => {
    return teams.filter(team => !team.is_taken).length;
};

/**
 * Checks if a team is available (not taken)
 * @param {Object} team - Team object
 * @returns {boolean} - True if team is available
 */
export const isTeamAvailable = (team) => {
    return !team.is_taken;
};

/**
 * Gets team status display text
 * @param {Object} team - Team object
 * @returns {string} - "Available" or "Taken"
 */
export const getTeamStatusText = (team) => {
    return team.is_taken ? 'Taken' : 'Available';
};

/**
 * Gets team status color for UI components
 * @param {Object} team - Team object
 * @returns {string} - Color name for Material-UI
 */
export const getTeamStatusColor = (team) => {
    return team.is_taken ? 'secondary' : 'success';
};

/**
 * Formats team statistics for display
 * @param {Object} team - Team object
 * @returns {Object} - Formatted stats object
 */
export const formatTeamStats = (team) => {
    return {
        currentRecord: formatTeamRecord(team.current_wins, team.current_losses),
        currentConferenceRecord: formatTeamRecord(team.current_conference_wins, team.current_conference_losses),
        overallRecord: formatTeamRecord(team.overall_wins, team.overall_losses),
        overallConferenceRecord: formatTeamRecord(team.overall_conference_wins, team.overall_conference_losses),
        bowlRecord: formatTeamRecord(team.bowl_wins, team.bowl_losses),
        playoffRecord: formatTeamRecord(team.playoff_wins, team.playoff_losses),
        conferenceChampionshipRecord: formatTeamRecord(team.conference_championship_wins, team.conference_championship_losses),
        nationalChampionshipRecord: formatTeamRecord(team.national_championship_wins, team.national_championship_losses)
    };
};

/**
 * Gets team coaches information for display
 * @param {Object} team - Team object
 * @returns {Array} - Array of coach objects with formatted data
 */
export const getTeamCoaches = (team) => {
    if (!team.coach_names || team.coach_names.length === 0) {
        return [];
    }

    return team.coach_names.map((name, index) => ({
        name: name,
        username: team.coach_usernames?.[index] || null,
        discordTag: team.coach_discord_tags?.[index] || null,
        discordId: team.coach_discord_ids?.[index] || null
    }));
};

/**
 * Gets team playbook information with proper formatting
 * @param {Object} team - Team object
 * @returns {Object} - Playbook information with formatted names
 */
export const getTeamPlaybooks = (team) => {
    const formatPlaybookName = (playbook) => {
        if (!playbook) return 'N/A';
        
        // Convert enum values to human-readable descriptions
        const playbookMappings = {
            // Offensive Playbooks
            'FLEXBONE': 'Flexbone',
            'AIR_RAID': 'Air Raid',
            'PRO': 'Pro',
            'SPREAD': 'Spread',
            'WEST_COAST': 'West Coast',
            
            // Defensive Playbooks
            'FOUR_THREE': '4-3',
            'THREE_FOUR': '3-4',
            'FIVE_TWO': '5-2',
            'FOUR_FOUR': '4-4',
            'THREE_THREE_FIVE': '3-3-5'
        };
        
        return playbookMappings[playbook] || playbook;
    };
    
    return {
        offensive: formatPlaybookName(team.offensive_playbook),
        defensive: formatPlaybookName(team.defensive_playbook)
    };
};

/**
 * Gets team ranking information
 * @param {Object} team - Team object
 * @returns {Object} - Ranking information
 */
export const getTeamRankings = (team) => {
    return {
        coachesPoll: team.coaches_poll_ranking,
        playoffCommittee: team.playoff_committee_ranking
    };
};

/**
 * Gets team colors for UI theming
 * @param {Object} team - Team object
 * @returns {Object} - Color information
 */
export const getTeamColors = (team) => {
    return {
        primary: team.primary_color || '#004260',
        secondary: team.secondary_color || '#d12a2e'
    };
}; 