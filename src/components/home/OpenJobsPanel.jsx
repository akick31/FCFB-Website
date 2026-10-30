import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamName from '../ui/TeamName';
import ConferenceMark from '../ui/ConferenceMark';
import MiniRow from './MiniRow';
import FitPagedList from '../ui/FitPagedList';
import { compact, primaryButtonSx } from '../../styles/controls';

const OpenJobsPanel = ({ teams, signedIn }) => (
    <Panel sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
            sx={{
                p: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid var(--line-soft)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
            }}
        >
            <Box sx={{ flex: 1 }}>
                {teams.length === 0 ? (
                    'Every program has a coach.'
                ) : (
                    <Box
                        component={Link}
                        to="/teams/all/open"
                        sx={{ color: 'inherit', '&:hover': { color: 'var(--brand)' } }}
                    >
                        {teams.length} programs need a head coach
                    </Box>
                )}
            </Box>
            {!signedIn && (
                <Box component={Link} to="/register" sx={{ ...compact(primaryButtonSx), textDecoration: 'none' }}>
                    Apply to coach
                </Box>
            )}
        </Box>
        <FitPagedList
            rows={teams.map((team) => ({ key: team.name, team }))}
            noun="programs"
            renderRow={({ team }) => (
                <MiniRow dense to={team.id ? `/team-details/${team.id}` : undefined}>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', fontWeight: 700, fontSize: '0.84rem' }}>
                        <TeamName name={team.name} size={20} />
                    </Box>
                    <ConferenceMark conference={team.conference} size={18} />
                </MiniRow>
            )}
        />
    </Panel>
);

OpenJobsPanel.propTypes = {
    teams: PropTypes.array.isRequired,
    signedIn: PropTypes.bool,
};

export default OpenJobsPanel;
