const ORDINALS = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };

export const ordinalDown = (down) => ORDINALS[down] || (down != null ? `${down}th` : '');

export const formatBallSpot = (ballLocation, possession, homeAbbr, awayAbbr) => {
    const spot = Number(ballLocation);
    if (Number.isNaN(spot)) return '';
    if (spot === 50) return 'at midfield';
    if (spot < 50) return `at own ${spot}`;
    const opponent = possession === 'HOME' ? awayAbbr : homeAbbr;
    return `at ${opponent} ${100 - spot}`;
};

export const formatDownDistanceSpot = (play, homeAbbr, awayAbbr) => {
    if (!play?.down) return '';
    const spot = formatBallSpot(play.ball_location, play.possession, homeAbbr, awayAbbr);
    return `${ordinalDown(play.down)} & ${play.yards_to_go}${spot ? ` ${spot}` : ''}`;
};

export const describePlay = (play) => {
    if (!play) return '';
    const result = String(play.actual_result || play.result || '').toUpperCase();
    const call = String(play.play_call || '').toUpperCase();
    const yards = play.yards;
    const distance = play.yards_to_go;
    const down = play.down;

    const withFirstDown = (base) =>
        yards != null && distance != null && down && down < 4 && yards >= distance && !result.includes('TOUCHDOWN')
            ? `${base}, first down`
            : base;

    if (result.includes('TOUCHDOWN')) {
        if (result.includes('KICK')) return 'Kickoff return touchdown';
        if (result.includes('PUNT')) return 'Punt return touchdown';
        if (result.includes('DEFENSIVE') || result.includes('PICK')) return 'Defensive touchdown';
        return yards ? `${Math.abs(yards)}-yard touchdown` : 'Touchdown';
    }
    if (result === 'INCOMPLETE') return 'Incomplete pass';
    if (result === 'INTERCEPTION') return 'Intercepted';
    if (result === 'FUMBLE') return 'Fumble lost';
    if (result === 'SACK') return `Sack for a loss of ${Math.abs(yards || 0)}`;
    if (result === 'FIELD_GOAL' || result === 'GOOD') return 'Field goal is good';
    if (result.includes('MISSED_FIELD_GOAL') || result === 'NO_GOOD') return 'Field goal missed';
    if (result.includes('PUNT')) return 'Punt';
    if (result === 'TURNOVER_ON_DOWNS') return 'Turnover on downs';
    if (result === 'KNEEL') return 'Kneel';
    if (result === 'SPIKE') return 'Spike';
    if (result === 'TOUCHBACK') return 'Touchback';

    const verb = call === 'PASS' ? 'Pass' : call === 'RUN' || call === 'RUSH' ? 'Run' : call ? call.charAt(0) + call.slice(1).toLowerCase() : 'Play';
    if (yards == null) return verb;
    if (yards > 0) return withFirstDown(`${verb} for ${yards} yard${yards !== 1 ? 's' : ''}`);
    if (yards === 0) return `${verb} for no gain`;
    return `${verb} for a loss of ${Math.abs(yards)}`;
};
