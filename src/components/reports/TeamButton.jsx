import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';

const TeamButton = ({ team, onClick }) =>
    team ? (
        <Box
            component="button"
            type="button"
            onClick={() => onClick(team)}
            title={`${team} coaching history`}
            sx={{
                border: 0,
                background: 'none',
                p: 0,
                font: 'inherit',
                color: 'inherit',
                cursor: 'pointer',
                fontWeight: 700,
                justifySelf: 'start',
                textAlign: 'left',
                minWidth: 0,
                maxWidth: '100%',
            }}
        >
            <TeamName name={team} />
        </Box>
    ) : (
        <Box component="span" sx={{ color: 'var(--text-dim)' }}>
            No team
        </Box>
    );

TeamButton.propTypes = { team: PropTypes.string, onClick: PropTypes.func.isRequired };

export default TeamButton;
