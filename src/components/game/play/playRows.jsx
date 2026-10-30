import React from 'react';
import TeamName from '../../ui/TeamName';
import UserLink from '../../ui/UserLink';
import { formatClock } from '../../../utils/gameDetail';
import { formatBallSpot, formatDownDistanceSpot } from '../../../utils/formatPlay';
import { enumLabel, formatDuration, percent } from '../../../utils/playDetail';

const quarterLabel = (quarter) => (quarter > 4 ? `OT${quarter > 5 ? quarter - 4 : ''}` : `Q${quarter}`);

const yesNo = (value) => (value ? 'Yes' : 'No');
const signed = (value) => (value == null ? '-' : `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`);

export const overviewRows = ({ play, previous, offense, homeAbbr, awayAbbr, awayName, homeName }) => [
    ['Offense', <TeamName key="o" name={offense} size={18} />],
    ['Yards', play.yards ?? '-'],
    ['Time', `${quarterLabel(play.quarter)} ${formatClock(play.clock)}`],
    [
        'Situation',
        formatDownDistanceSpot(play, homeAbbr, awayAbbr) ||
            formatBallSpot(play.ball_location, play.possession, homeAbbr, awayAbbr),
    ],
    ['Play call', enumLabel(play.play_call)],
    ['Result', enumLabel(play.result)],
    ['Outcome', enumLabel(play.actual_result)],
    ['Score before', `${awayName} ${previous?.away_score ?? 0}, ${homeName} ${previous?.home_score ?? 0}`],
    ['Score after', `${awayName} ${play.away_score}, ${homeName} ${play.home_score}`],
];

export const numberRows = (play) => {
    const resolved = play.play_finished;
    return [
        ['Offensive number', resolved ? (play.offensive_number ?? '-') : 'Hidden until the play resolves'],
        ['Defensive number', resolved ? (play.defensive_number ?? '-') : 'Hidden until the play resolves'],
        ['Difference', resolved ? (play.difference ?? '-') : '-'],
        ['Offense submitted by', <UserLink key="o" username={play.offensive_submitter} />],
        ['Offense response time', formatDuration(play.offensive_response_speed)],
        ['Defense submitted by', <UserLink key="d" username={play.defensive_submitter} />],
        ['Defense response time', formatDuration(play.defensive_response_speed)],
    ];
};

export const clockRows = ({ play, awayName, homeName }) => [
    ['Play time', formatDuration(play.play_time)],
    ['Runoff', formatDuration(play.runoff_time)],
    ['Timeout used', yesNo(play.timeout_used)],
    ['Offense called timeout', yesNo(play.offensive_timeout_called)],
    ['Defense called timeout', yesNo(play.defensive_timeout_called)],
    [`${awayName} timeouts left`, play.away_timeouts ?? '-'],
    [`${homeName} timeouts left`, play.home_timeouts ?? '-'],
];

export const winProbabilityRows = ({ play, swing, offense, awayName, homeName }) => [
    [`${offense} win chance after the play`, percent(play.win_probability)],
    [`${homeName} win chance before`, percent(swing.before)],
    [`${homeName} win chance after`, percent(swing.after)],
    [`Swing for ${homeName}`, signed(swing.change)],
    [`Swing for ${awayName}`, signed(swing.change == null ? null : -swing.change)],
];

export const recordRows = ({ play, index, total }) => [
    ['Play', index >= 0 ? `${index + 1} of ${total}` : play.play_number],
    ['Play ID', play.play_id],
    ['Game ID', play.game_id],
    ['Finished', yesNo(play.play_finished)],
];
