import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { STAT_GROUPS, statCell } from '../../utils/teamStatFields';

const SeasonStatTable = ({ stats }) => (
    <Box>
        {STAT_GROUPS.map(([groupName, rows]) => (
            <React.Fragment key={groupName}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.75, py: 1, background: 'var(--surface-2)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', borderBottom: '1px solid var(--line-soft)' }}>
                    <span>{groupName}</span>
                    {rows.some((row) => row.opp) && <span>Team / Opp</span>}
                </Box>
                {rows.map((row) => {
                    const team = statCell(row, stats);
                    const opp = row.opp ? statCell(row, stats, 'opponent_') : null;
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
