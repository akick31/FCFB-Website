import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamSelect from './TeamSelect';

const TeamFilterPill = ({
    value,
    onChange,
    teams,
    allValue = 'ALL',
    allLabel = 'All teams',
    label = 'Team',
    width = 240,
}) => (
    <Box
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '38px',
            boxSizing: 'border-box',
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            borderRadius: 'var(--r-sm)',
            pl: '10px',
            width,
            maxWidth: '100%',
        }}
    >
        <Box
            component="span"
            sx={{
                color: 'var(--text-dim)',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: '0.6rem',
                letterSpacing: '0.04em',
            }}
        >
            {label}
        </Box>
        <TeamSelect
            value={value === allValue ? '' : value}
            onChange={(name) => onChange(name || allValue)}
            teams={teams}
            noneLabel={allLabel}
            ariaLabel={label}
            sx={{
                flex: 1,
                '& .MuiOutlinedInput-notchedOutline': { border: 0 },
                '& .MuiOutlinedInput-root': { py: 0, pl: '2px' },
                '& .MuiInputBase-input': { fontWeight: 700, fontSize: '0.8rem' },
            }}
        />
    </Box>
);

TeamFilterPill.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    teams: PropTypes.arrayOf(PropTypes.string).isRequired,
    allValue: PropTypes.string,
    allLabel: PropTypes.string,
    label: PropTypes.string,
    width: PropTypes.number,
};

export default TeamFilterPill;
