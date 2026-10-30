import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Paged from '../ui/Paged';
import DataTable from '../ui/DataTable';

const DETAIL_FIELDS = [
    ['offensive_number', 'Offensive number'],
    ['defensive_number', 'Defensive number'],
    ['difference', 'Difference'],
    ['offensive_submitter', 'Offense submitted by'],
    ['defensive_submitter', 'Defense submitted by'],
    ['actual_result', 'Actual result'],
    ['play_time', 'Play time'],
    ['runoff_time', 'Runoff time'],
    ['win_probability', 'Win probability'],
    ['win_probability_added', 'Win probability added'],
    ['offensive_response_speed', 'Offense response speed'],
    ['defensive_response_speed', 'Defense response speed'],
];

const clockOf = (seconds) =>
    typeof seconds === 'number' ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : seconds;

const shown = (value) => (value === null || value === undefined || value === '' ? '-' : String(value));

const PlayDetails = ({ play }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: '8px 18px',
            p: '10px 4px',
            whiteSpace: 'normal',
            textAlign: 'left',
        }}
    >
        {DETAIL_FIELDS.map(([key, label]) => (
            <Box key={key}>
                <Box
                    sx={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase' }}
                >
                    {label}
                </Box>
                <Box sx={{ fontSize: '0.82rem' }}>{shown(play[key])}</Box>
            </Box>
        ))}
    </Box>
);

PlayDetails.propTypes = { play: PropTypes.object.isRequired };

const GamePlaysTable = ({ plays }) => {
    const [openId, setOpenId] = useState(null);
    return (
        <Paged rows={plays} noun="plays">
            {(pageRows) => (
                <DataTable minWidth={720} tableLayout="fixed">
                    <thead>
                        <tr>
                            <th className="lft" style={{ width: 48 }}>
                                #
                            </th>
                            <th style={{ width: 40 }}>Q</th>
                            <th style={{ width: 64 }}>Clock</th>
                            <th className="lft" style={{ width: 70 }}>
                                Poss
                            </th>
                            <th style={{ width: 80 }}>Down</th>
                            <th style={{ width: 56 }}>Ball</th>
                            <th className="lft">Call</th>
                            <th className="lft">Result</th>
                            <th style={{ width: 56 }}>Yds</th>
                            <th style={{ width: 70 }}>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((play, index) => {
                            const id = play.id ?? index;
                            const open = openId === id;
                            return (
                                <React.Fragment key={id}>
                                    <tr onClick={() => setOpenId(open ? null : id)} aria-expanded={open}>
                                        <td className="lft">{play.play_number || index + 1}</td>
                                        <td>{shown(play.quarter)}</td>
                                        <td>{shown(clockOf(play.clock))}</td>
                                        <td className="lft">{shown(play.possession)}</td>
                                        <td>{play.down ? `${play.down} & ${shown(play.yards_to_go)}` : '-'}</td>
                                        <td>{shown(play.ball_location)}</td>
                                        <td className="lft">{shown(play.play_call)}</td>
                                        <td className="lft">{shown(play.result)}</td>
                                        <td>{shown(play.yards)}</td>
                                        <td>{`${shown(play.away_score)}-${shown(play.home_score)}`}</td>
                                    </tr>
                                    {open && (
                                        <tr>
                                            <td colSpan={10}>
                                                <PlayDetails play={play} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </DataTable>
            )}
        </Paged>
    );
};

GamePlaysTable.propTypes = { plays: PropTypes.array.isRequired };

export default GamePlaysTable;
