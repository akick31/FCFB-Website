export const formatConference = (conference) => {
    if (!conference) return '-';

    if (conference === 'ACC') return 'ACC';
    if (conference === 'BIG_12') return 'Big 12';
    if (conference === 'BIG_TEN') return 'Big Ten';
    if (conference === 'AMERICAN') return 'American';
    if (conference === 'CUSA') return 'C-USA';
    if (conference === 'FBS_INDEPENDENT') return 'FBS Independent';
    if (conference === 'MAC') return 'MAC';
    if (conference === 'MOUNTAIN_WEST') return 'Mountain West';
    if (conference === 'PAC_12') return 'Pac-12';
    if (conference === 'SEC') return 'SEC';
    if (conference === 'SUN_BELT') return 'Sun Belt';
    if (conference === 'ATLANTIC_SUN') return 'Atlantic Sun';
    if (conference === 'BIG_SKY') return 'Big Sky';
    if (conference === 'CAROLINA_FOOTBALL_CONFERENCE') return 'Carolina Football Conference';
    if (conference === 'MISSOURI_VALLEY') return 'Missouri Valley';
    if (conference === 'COLONIAL') return 'Colonial';
    if (conference === 'NEC') return 'NEC';
    if (conference === 'IVY_LEAGUE') return 'Ivy League';
    if (conference === 'MID_ATLANTIC') return 'Mid-Atlantic';
    if (conference === 'SOUTHLAND') return 'Southland';
    if (conference === 'OHIO_VALLEY') return 'Ohio Valley';
    if (conference === 'SWAC') return 'SWAC';

    return conference
};

export const formatPlaybook = (playbook) => {
    if (!playbook) return '-';

    if (playbook === 'AIR_RAID') return 'Air Raid';
    if (playbook === 'SPREAD') return 'Spread';
    if (playbook === 'PRO') return 'Pro';
    if (playbook === 'WEST_COAST') return 'West Coast';
    if (playbook === 'FLEXBONE') return 'Flexbone';
    if (playbook === 'THREE_FOUR') return '3-4';
    if (playbook === 'FOUR_THREE') return '4-3';
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