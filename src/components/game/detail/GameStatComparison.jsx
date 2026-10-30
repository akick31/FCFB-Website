import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import SegTabs from '../../ui/SegTabs';
import TeamMark from '../../ui/TeamMark';
import ComparisonTable from '../../ui/ComparisonTable';
import { STAT_GROUPS, statCell } from '../../../utils/teamStatFields';

const GameStatComparison = ({ awayStats, homeStats, awayMark, homeMark }) => {
    const [groupName, setGroupName] = useState(STAT_GROUPS[0][0]);
    const [, rows] = STAT_GROUPS.find(([name]) => name === groupName) || STAT_GROUPS[0];
    const tableRows = rows.map((row) => ({
        label: row.label,
        away: statCell(row, awayStats),
        home: statCell(row, homeStats),
    }));
    const half = Math.ceil(tableRows.length / 2);
    const halves = [tableRows.slice(0, half), tableRows.slice(half)].filter((part) => part.length > 0);
    return (
        <Panel>
            <Box sx={{ p: '10px 12px', borderBottom: '1px solid var(--line-soft)' }}>
                <SegTabs
                    value={groupName}
                    onChange={setGroupName}
                    ariaLabel="Stat group"
                    options={STAT_GROUPS.map(([name]) => ({ value: name, label: name }))}
                />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: '20px' }}>
                {halves.map((part, index) => (
                    <ComparisonTable
                        key={index}
                        awayHeader={<TeamMark team={awayMark} size={20} />}
                        homeHeader={<TeamMark team={homeMark} size={20} />}
                        sections={[{ rows: part }]}
                    />
                ))}
            </Box>
        </Panel>
    );
};

GameStatComparison.propTypes = {
    awayStats: PropTypes.object.isRequired,
    homeStats: PropTypes.object.isRequired,
    awayMark: PropTypes.object,
    homeMark: PropTypes.object,
};

export default GameStatComparison;
