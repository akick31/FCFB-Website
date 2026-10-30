import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { similarStadiums } from './similarStadiums';

const StadiumSuggestions = ({ typed, stadiums, onPick }) => {
    const matches = similarStadiums(typed, stadiums);
    if (!matches.length) {
        return null;
    }
    return (
        <Box
            sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', mt: '4px', fontSize: '0.72rem' }}
        >
            <Box component="span" sx={{ color: 'var(--text-dim)' }}>
                Did you mean
            </Box>
            {matches.map((stadium) => (
                <Box
                    key={stadium.name}
                    component="button"
                    type="button"
                    onClick={() => onPick(stadium.name)}
                    sx={{
                        border: '1px solid var(--line)',
                        background: 'var(--surface-2)',
                        color: 'var(--text)',
                        borderRadius: '999px',
                        px: '8px',
                        py: '2px',
                        font: 'inherit',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    {stadium.name}
                </Box>
            ))}
        </Box>
    );
};

StadiumSuggestions.propTypes = {
    typed: PropTypes.string.isRequired,
    stadiums: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })).isRequired,
    onPick: PropTypes.func.isRequired,
};

export default StadiumSuggestions;
