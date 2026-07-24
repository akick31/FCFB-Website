import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { STAT_GROUPS } from '../../utils/teamStatFields';

const num = (value) => (value == null ? null : (typeof value === 'number' ? value.toLocaleString() : value));
const clock = (value) => {
    if (value == null) return null;
    const total = Math.round(value);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const FORMATS = {
    num,
    clock,
    dec1: (value) => (value == null ? null : Number(value).toFixed(1)),
    dec2: (value) => (value == null ? null : Number(value).toFixed(2)),
    pct: (value) => (value == null ? null : `${Number(value).toFixed(1)}%`),
    sgn: (value) => (value == null ? null : (value > 0 ? `+${value}` : `${value}`)),
};

const ratio = (made, att) => (made == null && att == null ? null : `${num(made) ?? 0}/${num(att) ?? 0}`);

const teamValue = (row, stats) => {
    if (row.fmt === 'fgratio') return ratio(stats[row.made], stats[row.att]);
    return FORMATS[row.fmt](stats[row.key]);
};

const oppValue = (row, stats) => {
    if (!row.opp) return null;
    if (row.fmt === 'fgratio') return ratio(stats[`opponent_${row.made}`], stats[`opponent_${row.att}`]);
    const value = stats[`opponent_${row.key}`];
    return value == null ? null : FORMATS[row.fmt](value);
};

const SeasonStatTable = ({ stats }) => (
    <Box>
        {STAT_GROUPS.map(([groupName, rows]) => (
            <React.Fragment key={groupName}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.75, py: 1, background: 'var(--surface-2)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', borderBottom: '1px solid var(--line-soft)' }}>
                    <span>{groupName}</span>
                    {rows.some((row) => row.opp) && <span>Team / Opp</span>}
                </Box>
                {rows.map((row) => {
                    const team = teamValue(row, stats);
                    const opp = oppValue(row, stats);
                    return (
                        <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', px: 1.75, py: 1, borderBottom: '1px solid var(--line-soft)', fontSize: '0.82rem', '&:last-of-type': { borderBottom: 'none' } }}>
                            <Box component="span" sx={{ color: 'var(--text-muted)' }}>{row.label}</Box>
                            <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                {team ?? '-'}
                                {opp != null && <Box component="span" sx={{ color: 'var(--text-dim)' }}> / {opp}</Box>}
                            </Box>
                        </Box>
                    );
                })}
            </React.Fragment>
        ))}
    </Box>
);

SeasonStatTable.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default SeasonStatTable;
