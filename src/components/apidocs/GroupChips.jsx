import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { compact, secondaryButtonSx } from '../../styles/controls';

const chipSx = (on) => ({
    ...compact(secondaryButtonSx),
    ...(on && {
        borderColor: 'var(--brand)',
        background: 'color-mix(in srgb, var(--brand) 18%, var(--surface-2))',
        color: 'var(--text)',
    }),
});

const GroupChips = ({ groups, picked, onChange }) => {
    const toggle = (tag) => onChange(picked.includes(tag) ? picked.filter((t) => t !== tag) : [...picked, tag]);
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} role="group" aria-label="Endpoint groups">
            <Box
                component="button"
                type="button"
                aria-pressed={picked.length === 0}
                onClick={() => onChange([])}
                sx={chipSx(picked.length === 0)}
            >
                All
            </Box>
            {groups.map(([tag, operations]) => (
                <Box
                    key={tag}
                    component="button"
                    type="button"
                    aria-pressed={picked.includes(tag)}
                    onClick={() => toggle(tag)}
                    sx={chipSx(picked.includes(tag))}
                >
                    {tag} ({operations.length})
                </Box>
            ))}
        </Box>
    );
};

GroupChips.propTypes = {
    groups: PropTypes.array.isRequired,
    picked: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default GroupChips;
