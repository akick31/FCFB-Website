import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';

const SingleWeekBars = ({ lines, invert = false, format }) => {
    const rows = lines
        .filter((line) => line.pts.length > 0)
        .map((line) => ({ ...line, val: line.pts[line.pts.length - 1].val }))
        .sort((a, b) => (invert ? a.val - b.val : b.val - a.val));
    const values = rows.map((row) => row.val);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const span = high - low || 1;
    const share = (val) => 0.15 + 0.85 * (invert ? (high - val) / span : (val - low) / span);
    return (
        <Box>
            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '8px' }}>
                Only one week so far. Lines show up once a second week is ranked.
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gridAutoFlow: { md: 'column' },
                    gridTemplateRows: { md: `repeat(${Math.ceil(rows.length / 2)}, auto)` },
                    gap: '2px 28px',
                }}
            >
                {rows.map((row) => (
                    <Box
                        key={row.team}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr) 64px',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.8rem',
                        }}
                    >
                        <TeamName name={row.team} size={16} />
                        <Box sx={{ height: 8, borderRadius: '4px', background: 'var(--surface-2)' }}>
                            <Box
                                sx={{
                                    height: '100%',
                                    width: `${share(row.val) * 100}%`,
                                    borderRadius: '4px',
                                    background: row.color,
                                }}
                            />
                        </Box>
                        <Box sx={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {format(row.val)}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

SingleWeekBars.propTypes = {
    lines: PropTypes.arrayOf(
        PropTypes.shape({
            team: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
            pts: PropTypes.arrayOf(PropTypes.shape({ val: PropTypes.number })).isRequired,
        })
    ).isRequired,
    invert: PropTypes.bool,
    format: PropTypes.func.isRequired,
};

export default SingleWeekBars;
