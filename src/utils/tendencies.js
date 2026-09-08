import { SPECIAL_TEAMS_PLAY_CALLS, tempoOf } from './scoutingReport';

const KICKOFF_CALLS = ['KICKOFF_NORMAL', 'KICKOFF_ONSIDE', 'KICKOFF_SQUIB'];

const NON_DOWN_PLAY_CALLS = ['KICKOFF_NORMAL', 'KICKOFF_ONSIDE', 'KICKOFF_SQUIB', 'PAT', 'TWO_POINT'];

const isSpecialTeams = (play) => SPECIAL_TEAMS_PLAY_CALLS.includes(String(play.play_call || '').toUpperCase());
const isNonDownPlay = (play) => NON_DOWN_PLAY_CALLS.includes(String(play.play_call || '').toUpperCase());

export const hasPossession = (play, mode, target) => (mode === 'coach'
    ? play.offensive_submitter_id === target
    : (play.possession === 'HOME' && play.home_team === target) || (play.possession === 'AWAY' && play.away_team === target));

export const playCallSplit = (plays, mode, target) => {
    const snaps = plays.filter((play) => hasPossession(play, mode, target) && !isSpecialTeams(play));
    const total = snaps.length;
    const runs = snaps.filter((play) => play.play_call === 'RUN').length;
    const passes = snaps.filter((play) => play.play_call === 'PASS').length;
    return {
        total,
        runs,
        passes,
        runPct: total ? runs / total : null,
        passPct: total ? passes / total : null,
    };
};

export const playCallByDown = (plays, mode, target) => {
    const result = {};
    [1, 2, 3, 4].forEach((down) => {
        const snaps = plays.filter((play) => hasPossession(play, mode, target) && !isNonDownPlay(play) && play.down === down);
        if (snaps.length === 0) {
            result[down] = null;
            return;
        }
        const counts = {};
        snaps.forEach((play) => {
            const call = play.play_call || 'UNKNOWN';
            counts[call] = (counts[call] || 0) + 1;
        });
        const [topCall, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        result[down] = { call: topCall, count: topCount, total: snaps.length, share: topCount / snaps.length };
    });
    return result;
};

export const fourthDownTendency = (plays, mode, target) => {
    const snaps = plays.filter((play) => hasPossession(play, mode, target) && play.down === 4);
    const wentForIt = snaps.filter((play) => play.play_call === 'RUN' || play.play_call === 'PASS').length;
    return {
        attempts: snaps.length,
        wentForIt,
        goForItRate: snaps.length ? wentForIt / snaps.length : null,
    };
};

export const tempoSplit = (plays, mode, target) => {
    const snaps = plays.filter((play) => hasPossession(play, mode, target) && !isNonDownPlay(play) && !KICKOFF_CALLS.includes(String(play.play_call || '').toUpperCase()));
    const total = snaps.length;
    const chew = snaps.filter((play) => tempoOf(play) === 'CHEW').length;
    const hurry = snaps.filter((play) => tempoOf(play) === 'HURRY').length;
    return {
        total,
        chew,
        hurry,
        chewPct: total ? chew / total : null,
        hurryPct: total ? hurry / total : null,
    };
};

export const kickoffTypeSplit = (plays, mode, target) => {
    const kicks = plays.filter((play) => hasPossession(play, mode, target) && KICKOFF_CALLS.includes(String(play.play_call || '').toUpperCase()));
    const total = kicks.length;
    const counts = { KICKOFF_NORMAL: 0, KICKOFF_ONSIDE: 0, KICKOFF_SQUIB: 0 };
    kicks.forEach((play) => { counts[play.play_call] = (counts[play.play_call] || 0) + 1; });
    return {
        total,
        counts,
        shares: total ? {
            KICKOFF_NORMAL: counts.KICKOFF_NORMAL / total,
            KICKOFF_ONSIDE: counts.KICKOFF_ONSIDE / total,
            KICKOFF_SQUIB: counts.KICKOFF_SQUIB / total,
        } : null,
    };
};
