export const formatTeamRecord = (wins, losses) => {
    return `${wins || 0}-${losses || 0}`;
};

export const getAvailableTeamsCount = (teams) => {
    return teams.filter(team => !team.is_taken).length;
};

export const isTeamAvailable = (team) => {
    return !team.is_taken;
};

export const getTeamStatusText = (team) => {
    return team.is_taken ? 'Taken' : 'Available';
};

export const getTeamStatusColor = (team) => {
    return team.is_taken ? 'secondary' : 'success';
};

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

export const getTeamPlaybooks = (team) => {
    const formatPlaybookName = (playbook) => {
        if (!playbook) return 'N/A';
        
        const playbookMappings = {
            'FLEXBONE': 'Flexbone',
            'AIR_RAID': 'Air Raid',
            'PRO': 'Pro',
            'SPREAD': 'Spread',
            'WEST_COAST': 'West Coast',
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

export const getTeamRankings = (team) => {
    return {
        coachesPoll: team.coaches_poll_ranking,
        playoffCommittee: team.playoff_committee_ranking
    };
};

export const getTeamColors = (team) => {
    return {
        primary: team.primary_color || '#004260',
        secondary: team.secondary_color || '#d12a2e'
    };
}; 