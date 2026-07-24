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

const humanize = (value) =>
    value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const describePlay = (play, context = {}) => {
    if (!play) return '';
    const outcome = String(play.actual_result || '').toUpperCase();
    const scenario = String(play.result || '').toUpperCase();
    const call = String(play.play_call || '').toUpperCase();
    const yards = play.yards;
    const distance = play.yards_to_go;
    const down = play.down;

    const homeName = context.homeName || play.home_team;
    const awayName = context.awayName || play.away_team;
    const possessionTeam = play.possession === 'HOME' ? homeName : awayName;
    const verb = call === 'PASS' ? 'Pass' : call === 'RUN' || call === 'RUSH' ? 'Run' : null;

    const gainPhrase = () => {
        if (verb) {
            if (yards == null) return verb;
            if (yards > 0) return `${verb} for ${yards} yard${yards !== 1 ? 's' : ''}`;
            if (yards === 0) return `${verb} for no gain`;
            return `${verb} for a loss of ${Math.abs(yards)}`;
        }
        if (yards == null) return 'Play';
        if (yards > 0) return `Gain of ${yards} yard${yards !== 1 ? 's' : ''}`;
        if (yards === 0) return 'No gain';
        return `Loss of ${Math.abs(yards)}`;
    };
    const withFirstDown = (text) =>
        outcome === 'FIRST_DOWN' || (yards != null && distance != null && down && down < 4 && yards >= distance)
            ? `${text}, first down`
            : text;

    if (outcome === 'TOUCHDOWN') {
        if (call === 'PASS') return yards ? `${Math.abs(yards)}-yard touchdown pass` : 'Passing touchdown';
        if (verb === 'Run') return yards ? `${Math.abs(yards)}-yard rushing touchdown` : 'Rushing touchdown';
        return yards ? `${Math.abs(yards)}-yard touchdown` : 'Touchdown';
    }
    if (outcome === 'RETURN_TOUCHDOWN') return 'Kick return touchdown';
    if (outcome === 'PUNT_RETURN_TOUCHDOWN') return 'Punt return touchdown';
    if (outcome === 'KICK_SIX') return 'Blocked kick returned for a touchdown';
    if (outcome === 'TURNOVER_TOUCHDOWN') return 'Defensive touchdown';
    if (outcome === 'KICKING_TEAM_TOUCHDOWN' || outcome === 'PUNT_TEAM_TOUCHDOWN') return 'Recovered for a touchdown';

    if (outcome === 'FAILED_ONSIDE') return 'Failed onside kick';
    if (outcome === 'SUCCESSFUL_ONSIDE') return 'Successful onside kick';
    if (outcome === 'MUFFED_KICK') return 'Muffed kickoff';
    if (outcome === 'MUFFED_PUNT') return 'Muffed punt';
    if (outcome === 'KICKOFF') return 'Kickoff';
    if (outcome === 'TOUCHBACK' || scenario === 'TOUCHBACK') return 'Touchback';
    if (outcome === 'SAFETY') return 'Safety';
    if (outcome === 'END_OF_HALF') return 'End of half';

    if (outcome === 'DELAY_OF_GAME') {
        const team = scenario === 'DELAY_OF_GAME_HOME' ? homeName : scenario === 'DELAY_OF_GAME_AWAY' ? awayName : possessionTeam;
        return team ? `Delay of game on ${team}` : 'Delay of game';
    }

    if (call === 'FIELD_GOAL') {
        if (outcome === 'GOOD') return 'Field goal is good';
        if (outcome === 'NO_GOOD') return 'Field goal is no good';
        if (outcome === 'BLOCKED') return 'Field goal blocked';
    }
    if (call === 'PUNT' && outcome === 'BLOCKED') return 'Punt blocked';
    if (call === 'PAT') {
        if (outcome === 'GOOD' || outcome === 'SUCCESS') return 'Extra point is good';
        if (outcome === 'NO_GOOD' || outcome === 'FAILED') return 'Extra point missed';
    }
    if (call === 'TWO_POINT') {
        if (outcome === 'GOOD' || outcome === 'SUCCESS') return 'Two-point conversion is good';
        if (outcome === 'NO_GOOD' || outcome === 'FAILED') return 'Two-point conversion failed';
    }
    if (outcome === 'DEFENSE_TWO_POINT') return 'Defensive two-point conversion';
    if (call === 'PUNT') return 'Punt';

    if (outcome === 'TURNOVER') {
        if (scenario.includes('FUMBLE')) return 'Fumble lost';
        if (call === 'PASS') return 'Intercepted';
        return 'Turnover';
    }
    if (outcome === 'FUMBLE' || scenario === 'FUMBLE') return 'Fumble lost';
    if (outcome === 'TURNOVER_ON_DOWNS') return 'Turnover on downs';

    if (scenario === 'INCOMPLETE') return 'Incomplete pass';
    if (outcome === 'SPIKE' || call === 'SPIKE') return 'Spike';
    if (outcome === 'KNEEL' || call === 'KNEEL') return 'Kneel';

    if (outcome === 'FIRST_DOWN' || outcome === 'GAIN') return withFirstDown(gainPhrase());
    if (outcome === 'NO_GAIN' || outcome === 'LOSS') return gainPhrase();

    return outcome ? humanize(outcome) : (scenario ? humanize(scenario) : 'Play');
};
