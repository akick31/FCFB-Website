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