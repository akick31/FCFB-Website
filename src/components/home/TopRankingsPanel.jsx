import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import MiniRow from './MiniRow';
import FitPagedList from '../ui/FitPagedList';
import { useTeamsMap } from '../../hooks/useTeamsMap';

const TopRankingsPanel = ({ rankings, dense = false }) => {
    const teamsMap = useTeamsMap();
    return (
        <Panel sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <FitPagedList
                rows={rankings.map((row) => ({ key: row.rank, ...row }))}
                noun="teams"
                renderRow={(row) => (
                    <MiniRow dense={dense} to={row.teamId ? `/team-details/${row.teamId}` : undefined}>
                        <Box sx={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.72rem', width: 22 }}>
                            #{row.rank}
                        </Box>
                        <TeamMark team={teamsMap[row.teamName]} size={22} />
                        <Box
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {row.teamName}
                        </Box>
                        <Box sx={{ ml: 'auto', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {row.wins}-{row.losses}
                        </Box>
                    </MiniRow>
                )}
            />
        </Panel>
    );
};

TopRankingsPanel.propTypes = {
    rankings: PropTypes.array.isRequired,
    dense: PropTypes.bool,
};

export default TopRankingsPanel;
