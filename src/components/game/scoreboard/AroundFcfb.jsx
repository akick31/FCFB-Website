import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import useWeekReview from '../../../hooks/useWeekReview';
import useAroundFcfb from '../../../hooks/useAroundFcfb';

const STRIP_ITEMS = [
    { id: 'upset', width: '1.6fr' },
    { id: 'upsets', width: '0.8fr' },
    { id: 'ranked', width: '1fr', label: 'Ranked losses' },
    { id: 'swing', width: '1fr' },
    { id: 'closest', width: '1.6fr' },
    { id: 'overtime', width: '0.8fr' },
];

const AroundFcfbStrip = ({ week }) => {
    const { rows, dialog } = useWeekReview(week);
    const items = STRIP_ITEMS.map((item) => ({ ...item, row: rows.find((row) => row.id === item.id) })).filter(
        (item) => item.row
    );
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'stretch',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r)',
                background: 'var(--surface)',
                mb: '12px',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    px: '14px',
                    background: 'var(--surface-2)',
                    whiteSpace: 'nowrap',
                }}
            >
                <Box
                    sx={{
                        fontFamily: 'var(--cond)',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}
                >
                    Around FCFB
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.64rem', fontWeight: 600 }}>Finals this week</Box>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, minmax(0, 1fr))',
                        md: items.map((item) => `minmax(0, ${item.width})`).join(' '),
                    },
                }}
            >
                {items.map((item) => (
                    <Box
                        key={item.id}
                        sx={{ px: '12px', py: '7px', minWidth: 0, borderLeft: '1px solid var(--line-soft)' }}
                    >
                        <Box
                            sx={{
                                color: 'var(--text-dim)',
                                fontSize: '0.58rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.label || item.row.label}
                        </Box>
                        <Box
                            sx={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                '& > *': { flexWrap: 'nowrap !important', justifyContent: 'flex-start !important' },
                            }}
                        >
                            {item.row.value}
                        </Box>
                    </Box>
                ))}
            </Box>
            {dialog}
        </Box>
    );
};

AroundFcfbStrip.propTypes = { week: PropTypes.object.isRequired };

const AroundFcfb = () => {
    const week = useAroundFcfb();
    return week?.games.length ? <AroundFcfbStrip week={week} /> : null;
};

export default AroundFcfb;
