import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import ScrollFade from './ScrollFade';
import useScrollFade from '../../hooks/useScrollFade';

const PageTabs = ({ value, onChange, options, ariaLabel, trailing }) => {
    const { ref, edges } = useScrollFade();
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '8px 14px',
                mb: '14px',
                borderBottom: '1px solid var(--line)',
            }}
        >
            <Box sx={{ position: 'relative', flex: '1 1 auto', minWidth: 0 }}>
                <ScrollFade edges={edges} color="var(--ground)" />
                <Box
                    ref={ref}
                    role="tablist"
                    aria-label={ariaLabel}
                    sx={{ display: 'flex', gap: '22px', overflowX: 'auto' }}
                >
                    {options.map((option) => (
                        <Box
                            key={option.value}
                            component="button"
                            type="button"
                            role="tab"
                            aria-selected={option.value === value}
                            onClick={() => onChange(option.value)}
                            sx={{
                                border: 0,
                                borderBottom: '3px solid',
                                borderColor: option.value === value ? 'var(--brand)' : 'transparent',
                                background: 'transparent',
                                color: option.value === value ? 'var(--text)' : 'var(--text-muted)',
                                px: '2px',
                                pb: '8px',
                                pt: '4px',
                                font: 'inherit',
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                '&:hover': { color: 'var(--text)' },
                            }}
                        >
                            {option.label}
                        </Box>
                    ))}
                </Box>
            </Box>
            {trailing && <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', pb: '8px' }}>{trailing}</Box>}
        </Box>
    );
};

PageTabs.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.node })).isRequired,
    ariaLabel: PropTypes.string,
    trailing: PropTypes.node,
};

export default PageTabs;
