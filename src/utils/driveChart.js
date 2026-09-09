import { humanizeEnumValue } from './humanize';

export const orderPlaysChronologically = (plays) => [...plays].sort((a, b) =>
    ((a.play_number ?? 0) - (b.play_number ?? 0))
    || ((a.quarter ?? 0) - (b.quarter ?? 0))
    || ((b.clock ?? 0) - (a.clock ?? 0))
    || ((a.play_id ?? 0) - (b.play_id ?? 0)));

const KICKOFF_CALLS = ['KICKOFF_NORMAL', 'KICKOFF_ONSIDE', 'KICKOFF_SQUIB'];
const isKickoff = (play) => KICKOFF_CALLS.includes(String(play.play_call || '').toUpperCase());

const RETURN_TOUCHDOWN_RESULTS = ['RETURN_TOUCHDOWN', 'PUNT_RETURN_TOUCHDOWN', 'KICK_SIX', 'TURNOVER_TOUCHDOWN', 'KICKING_TEAM_TOUCHDOWN', 'PUNT_TEAM_TOUCHDOWN'];
const isReturnTouchdown = (play) => RETURN_TOUCHDOWN_RESULTS.includes(String(play.actual_result || '').toUpperCase());
const isConversionAttempt = (play) => ['PAT', 'TWO_POINT'].includes(String(play.play_call || '').toUpperCase());

const kickoffStartReason = (play) => {
    const outcome = String(play.actual_result || '').toUpperCase();
    const call = String(play.play_call || '').toUpperCase();
    if (outcome === 'TOUCHBACK') return 'Kickoff (touchback)';
    if (outcome === 'SUCCESSFUL_ONSIDE') return 'Onside kick recovery';
    if (outcome === 'MUFFED_KICK') return 'Kickoff (muffed)';
    if (call === 'KICKOFF_SQUIB') return 'Squib kickoff return';
    if (call === 'KICKOFF_ONSIDE') return 'Onside kick return';
    return 'Kickoff return';
};

const turnoverStartReason = (play) => {
    const outcome = String(play.actual_result || '').toUpperCase();
    const call = String(play.play_call || '').toUpperCase();
    const scenario = String(play.result || '').toUpperCase();
    if (outcome === 'TURNOVER_ON_DOWNS') return 'Turnover on downs';
    if (call === 'PUNT') return 'Opponent punt';
    if (scenario.includes('FUMBLE') || outcome === 'MUFFED_PUNT') return 'Opponent fumble';
    if (call === 'PASS' && (outcome === 'TURNOVER' || outcome === 'TURNOVER_TOUCHDOWN' || outcome === 'KICK_SIX')) return 'Interception';
    if (outcome === 'SAFETY') return 'Free kick after safety';
    if (outcome === 'TURNOVER' || outcome === 'TURNOVER_TOUCHDOWN' || outcome === 'KICK_SIX') return 'Turnover';
    return 'Change of possession';
};

const conversionLabel = (play) => {
    const call = String(play.play_call || '').toUpperCase();
    const outcome = String(play.actual_result || '').toUpperCase();
    const made = outcome === 'GOOD' || outcome === 'SUCCESS';
    if (call === 'PAT') return made ? 'PAT Good' : 'PAT Missed';
    if (call === 'TWO_POINT') return made ? 'Two-Point Good' : 'Two-Point Failed';
    return null;
};

const driveOutcomeLabel = (plays, endedByClock) => {
    const last = plays[plays.length - 1];
    const touchdownPlay = plays.find((play) => String(play.actual_result || '').toUpperCase() === 'TOUCHDOWN');
    if (touchdownPlay) {
        const conversion = last !== touchdownPlay ? conversionLabel(last) : null;
        return conversion ? `Touchdown, ${conversion}` : 'Touchdown';
    }

    if (endedByClock === 'END_OF_GAME') return 'End of Game';
    if (endedByClock === 'END_OF_HALF') return 'End of Half';

    const outcome = String(last.actual_result || '').toUpperCase();
    const call = String(last.play_call || '').toUpperCase();
    const scenario = String(last.result || '').toUpperCase();

    if (outcome === 'SAFETY') return 'Safety';
    if (call === 'FIELD_GOAL') {
        if (outcome === 'GOOD') return 'Field Goal';
        if (outcome === 'BLOCKED') return 'Blocked Field Goal';
        return 'Missed Field Goal';
    }
    if (call === 'PUNT') return outcome === 'BLOCKED' ? 'Blocked Punt' : 'Punt';
    if (outcome === 'TURNOVER_ON_DOWNS') return 'Turnover on Downs';
    if (scenario.includes('FUMBLE') || outcome === 'MUFFED_KICK' || outcome === 'MUFFED_PUNT') return 'Turnover (Fumble)';
    if (call === 'PASS' && (outcome === 'TURNOVER' || outcome === 'TURNOVER_TOUCHDOWN' || outcome === 'KICK_SIX')) return 'Turnover (Interception)';
    if (outcome === 'TURNOVER' || outcome === 'TURNOVER_TOUCHDOWN' || outcome === 'KICK_SIX') return 'Turnover';
    if (outcome === 'KNEEL' || call === 'KNEEL') return 'Ran Out Clock';
    if (outcome === 'DELAY_OF_GAME') return 'Delay of Game';
    return humanizeEnumValue(outcome || call || 'drive ended');
};

export const buildDrives = (orderedPlays) => {
    const halfEndQuarters = new Set();
    let hasGameEndMarker = false;
    orderedPlays.forEach((play) => {
        const outcome = String(play.actual_result || '').toUpperCase();
        if (outcome === 'END_OF_HALF') halfEndQuarters.add(play.quarter);
        if (outcome === 'END_OF_GAME') hasGameEndMarker = true;
    });

    const relevant = orderedPlays.filter((play) => {
        const outcome = String(play.actual_result || '').toUpperCase();
        return outcome !== 'END_OF_GAME' && outcome !== 'END_OF_HALF';
    });

    const drives = [];
    let current = null;
    let lastKickoff = null;

    relevant.forEach((play) => {
        if (isKickoff(play)) {
            lastKickoff = play;
            current = null;
            return;
        }
        const previousPlay = current?.plays[current.plays.length - 1];
        const continuesReturnTouchdown = isConversionAttempt(play) && previousPlay && isReturnTouchdown(previousPlay);
        if (!current || (!continuesReturnTouchdown && current.possession !== play.possession)) {
            const previousDrive = drives[drives.length - 1];
            const startReason = lastKickoff
                ? kickoffStartReason(lastKickoff)
                : (previousDrive ? turnoverStartReason(previousDrive.plays[previousDrive.plays.length - 1]) : 'Start of game');
            current = {
                possession: play.possession,
                team: play.possession === 'HOME' ? play.home_team : play.away_team,
                quarter: play.quarter,
                startBallLocation: play.ball_location,
                startReason,
                homeScoreBefore: play.home_score,
                awayScoreBefore: play.away_score,
                plays: [],
                endedByClock: null,
            };
            drives.push(current);
            lastKickoff = null;
        }
        current.plays.push(play);
    });

    drives.forEach((drive, i) => {
        const driveEndQuarter = drive.plays[drive.plays.length - 1].quarter;
        const nextDrive = drives[i + 1];
        const precedesLaterQuarter = !nextDrive || nextDrive.plays[0].quarter > driveEndQuarter;
        if (!precedesLaterQuarter) return;
        if (!nextDrive && hasGameEndMarker) {
            drive.endedByClock = 'END_OF_GAME';
        } else if (halfEndQuarters.has(driveEndQuarter)) {
            drive.endedByClock = 'END_OF_HALF';
        }
    });

    return drives.map((drive, index) => {
        const last = drive.plays[drive.plays.length - 1];
        const netYards = drive.plays.reduce((sum, play) => sum + (play.yards || 0), 0);
        return {
            index,
            team: drive.team,
            possession: drive.possession,
            quarter: drive.quarter,
            playCount: drive.plays.length,
            startBallLocation: drive.startBallLocation,
            endBallLocation: last.ball_location,
            startReason: drive.startReason,
            netYards,
            outcome: driveOutcomeLabel(drive.plays, drive.endedByClock),
            homeScoreBefore: drive.homeScoreBefore,
            awayScoreBefore: drive.awayScoreBefore,
            homeScoreAfter: last.home_score,
            awayScoreAfter: last.away_score,
            plays: drive.plays,
        };
    });
};
