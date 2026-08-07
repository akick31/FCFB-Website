import { conferenceLabel } from '../components/constants/conferences';

export const formatConference = (conference) => {
    if (!conference) return '-';
    return conferenceLabel(conference);
};

export const formatOffensivePlaybook = (playbook) => {
    if (!playbook) return '-';

    if (playbook === 'FLEXBONE') return 'Flexbone';
    if (playbook === 'AIR_RAID') return 'Air Raid';
    if (playbook === 'PRO') return 'Pro';
    if (playbook === 'SPREAD') return 'Spread';
    if (playbook === 'WEST_COAST') return 'West Coast';

    return playbook;
}

export const formatDefensivePlaybook = (playbook) => {
    if (!playbook) return '-';

    if (playbook === 'FOUR_THREE') return '4-3';
    if (playbook === 'THREE_FOUR') return '3-4';
    if (playbook === 'FIVE_TWO') return '5-2';
    if (playbook === 'FOUR_FOUR') return '4-4';
    if (playbook === 'THREE_THREE_FIVE') return '3-3-5';

    return playbook;
}

export const formatPosition = (position) => {
    if (!position) return '-';

    if (position === 'HEAD_COACH') return 'Head Coach';
    if (position === 'OFFENSIVE_COORDINATOR') return 'Offensive Coordinator';
    if (position === 'DEFENSIVE_COORDINATOR') return 'Defensive Coordinator';

    return position;
}

export const formatRole = (role) => {
    if (!role) return '-';

    if (role === 'USER') return 'User';
    if (role === 'CONFERENCE_COMMISSIONER') return 'Conference Commissioner';
    if (role === 'ADMIN') return 'Admin';

    return role;
}

export const formatGameType = (gameType) => {
    if (!gameType) return '-';

    if (gameType === 'OUT_OF_CONFERENCE') return 'Out of Conference';
    if (gameType === 'CONFERENCE_GAME') return 'Conference Game';
    if (gameType === 'CONFERENCE_CHAMPIONSHIP') return 'Conference Championship';
    if (gameType === 'PLAYOFFS') return 'Playoffs';
    if (gameType === 'NATIONAL_CHAMPIONSHIP') return 'National Championship';
    if (gameType === 'BOWL') return 'Bowl';

    return gameType;
}
export const formatWinPct = (value) => {
    const pct = Number(value) || 0;
    const fixed = pct.toFixed(3);
    return fixed.startsWith('0.') ? fixed.slice(1) : fixed;
};

export const weekLabel = (week) => {
    if (week === 13) return 'Conference Championship Week';
    return `Week ${week}`;
};
