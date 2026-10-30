import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import ConferenceMark from '../ui/ConferenceMark';
import FitPagedList from '../ui/FitPagedList';
import MiniRow from './MiniRow';
import { useTeamsMap } from '../../hooks/useTeamsMap';

const divisionTagSx = {
    flexShrink: 0,
    px: '5px',
    py: '1px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--surface-2)',
    color: 'var(--text-dim)',
    fontSize: '0.6rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
};

const ConferenceLeadersPanel = ({ rows, dense = false }) => {
    const teamsMap = useTeamsMap();
    return (
        <Panel sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <FitPagedList
                rows={rows.filter((row) => row.team)}
                noun="leaders"
                renderRow={({ conference, division, team, champion: isChampion }, index, pageRows) => (
                    <MiniRow dense={dense} to={team.id ? `/team-details/${team.id}` : undefined}>
                        <Box sx={{ width: 22, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                            {pageRows[index - 1]?.conference !== conference && (
                                <ConferenceMark conference={conference} size={20} />
                            )}
                        </Box>
                        <TeamMark team={teamsMap[team.name]} size={22} />
                        <Box
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {team.name}
                        </Box>
                        {division && <Box sx={divisionTagSx}>{division}</Box>}
                        <Box
                            sx={{
                                ml: 'auto',
                                flexShrink: 0,
                                color: isChampion ? 'var(--gold)' : 'var(--text-dim)',
                                fontSize: '0.75rem',
                                fontWeight: isChampion ? 800 : 600,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {isChampion
                                ? 'Champion'
                                : `${team.current_conference_wins || 0}-${team.current_conference_losses || 0}`}
                        </Box>
                    </MiniRow>
                )}
            />
        </Panel>
    );
};

ConferenceLeadersPanel.propTypes = {
    rows: PropTypes.array.isRequired,
    dense: PropTypes.bool,
};

export default ConferenceLeadersPanel;
