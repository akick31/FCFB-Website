import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import ConferencePill from '../ui/ConferencePill';
import ConferenceName from '../ui/ConferenceName';
import ScrollFade from '../ui/ScrollFade';
import useScrollFade from '../../hooks/useScrollFade';
import { conferenceLabel } from '../../hooks/useConferencesMap';

const ConferenceTabs = ({ conferences, value, onChange }) => {
    const { ref, edges } = useScrollFade();

    useEffect(() => {
        const row = ref.current;
        const selected = row?.querySelector('[aria-selected="true"]');
        if (!selected) {
            return;
        }
        const left = selected.offsetLeft - row.offsetLeft;
        if (left < row.scrollLeft || left + selected.offsetWidth > row.scrollLeft + row.clientWidth) {
            row.scrollTo({ left: left - (row.clientWidth - selected.offsetWidth) / 2, behavior: 'smooth' });
        }
    }, [ref, value]);
    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    minWidth: 0,
                    flex: '1 1 0',
                    '@media (max-width:820px)': { display: 'none' },
                }}
            >
                <ScrollFade edges={edges} color="var(--ground)" />
                <Box
                    ref={ref}
                    role="tablist"
                    aria-label="Conference"
                    sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '4px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
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
                                padding: '5px 9px',
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                '&:hover': value === conf ? undefined : { background: 'var(--surface-2)' },
                            }}
                        >
                            <ConferenceName code={conf} size={16} />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: 'none', '@media (max-width:820px)': { display: 'inline-flex' } }}>
                <ConferencePill
                    label="Conference"
                    value={value}
                    onChange={onChange}
                    options={conferences.map((conf) => ({ value: conf, label: conferenceLabel(conf) }))}
                />
            </Box>
        </>
    );
};

ConferenceTabs.propTypes = {
    conferences: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ConferenceTabs;
