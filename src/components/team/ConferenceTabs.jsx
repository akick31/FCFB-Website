import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import SelectPill from '../ui/SelectPill';
import { conferenceLabel } from '../constants/conferences';

const ConferenceTabs = ({ conferences, value, onChange }) => (
    <>
        <Box
            role="tablist"
            aria-label="Conference"
            sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', '@media (max-width:820px)': { display: 'none' } }}
        >
            {conferences.map((conf) => (
                <Box
                    key={conf}
                    component="button"
                    type="button"
                    role="tab"
                    aria-selected={value === conf}
                    onClick={() => onChange(conf)}
                    sx={{
                        background: value === conf ? 'var(--brand-deep)' : 'var(--surface)',
                        border: '1px solid',
                        borderColor: value === conf ? 'var(--brand-deep)' : 'var(--line)',
                        color: value === conf ? '#fff' : 'var(--text-muted)',
                        borderRadius: 'var(--r-sm)',
                        font: 'inherit',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '7px 12px',
                        cursor: 'pointer',
                        '&:hover': value === conf ? undefined : { background: 'var(--surface-2)' },
                    }}
                >
                    {conferenceLabel(conf)}
                </Box>
            ))}
        </Box>
        <Box sx={{ display: 'none', '@media (max-width:820px)': { display: 'inline-flex' } }}>
            <SelectPill
                label="Conference"
                value={value}
                onChange={onChange}
                options={conferences.map((conf) => ({ value: conf, label: conferenceLabel(conf) }))}
            />
        </Box>
    </>
);

ConferenceTabs.propTypes = {
    conferences: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ConferenceTabs;
