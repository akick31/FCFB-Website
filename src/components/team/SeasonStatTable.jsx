import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import SegTabs from '../ui/SegTabs';
import { STAT_GROUPS, statCell } from '../../utils/teamStatFields';

const StatRow = ({ row, stats }) => {
    const team = statCell(row, stats);
    const opp = row.opp ? statCell(row, stats, 'opponent_') : null;
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '8px',
                px: 1.75,
                py: '7px',
                borderBottom: '1px solid var(--line-soft)',
                fontSize: '0.82rem',
            }}
        >
            <Box component="span" sx={{ color: 'var(--text-muted)' }}>
                {row.label}
            </Box>
            <Box component="span" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {team ?? '-'}
                {opp != null && (
                    <Box component="span" sx={{ color: 'var(--text-dim)' }}>
                        {' '}
                        / {opp}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

StatRow.propTypes = { row: PropTypes.object.isRequired, stats: PropTypes.object.isRequired };

const SeasonStatTable = ({ stats }) => {
    const [groupName, setGroupName] = useState(STAT_GROUPS[0][0]);
    const [, rows] = STAT_GROUPS.find(([name]) => name === groupName) || STAT_GROUPS[0];
    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    p: '10px 12px',
                    borderBottom: '1px solid var(--line-soft)',
                }}
            >
                <SegTabs
                    value={groupName}
                    onChange={setGroupName}
                    ariaLabel="Stat group"
                    options={STAT_GROUPS.map(([name]) => ({ value: name, label: name }))}
                />
                {rows.some((row) => row.opp) && (
                    <Box sx={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>Team / Opp</Box>
                )}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: '24px' }}>
                {rows.map((row) => (
                    <StatRow key={row.label} row={row} stats={stats} />
                ))}
            </Box>
        </Box>
    );
};

SeasonStatTable.propTypes = {
    stats: PropTypes.object.isRequired,
};

export default SeasonStatTable;
