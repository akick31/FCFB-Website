import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import DataTable from '../../ui/DataTable';
import PagedFooter from '../../ui/PagedFooter';
import TeamMark from '../../ui/TeamMark';
import usePagedRows from '../../../hooks/usePagedRows';
import useFitCount from '../../../hooks/useFitCount';
import { formatBallSpot } from '../../../utils/formatPlay';
import { compact, secondaryButtonSx } from '../../../styles/controls';

const compareDrives = (sort) => (a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    const result =
        typeof av === 'string' || typeof bv === 'string'
            ? String(av ?? '').localeCompare(String(bv ?? ''))
            : (av ?? 0) - (bv ?? 0);
    return (sort.dir === 'asc' ? result : -result) || a.index - b.index;
};

const DrivesTable = ({
    drives,
    homeTeam,
    homeMark,
    awayMark,
    onViewDrive,
    initialSort = { key: 'index', dir: 'asc' },
}) => {
    const [sort, setSort] = useState(initialSort);
    const sorted = useMemo(() => [...drives].sort(compareDrives(sort)), [drives, sort]);
    const [fitRef, pageSize] = useFitCount({ rowHeight: 44, phoneCount: 12 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(sorted, pageSize, `${sort.key}|${sort.dir}`);
    const spot = (location, possession) =>
        formatBallSpot(location, possession, homeMark?.abbreviation, awayMark?.abbreviation);
    const header = (key, label, className = '') => (
        <th
            className={className}
            onClick={() =>
                setSort((prev) =>
                    prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
                )
            }
            aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
            style={{ cursor: 'pointer', userSelect: 'none' }}
        >
            {label}
            {sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
        </th>
    );
    return (
        <Box ref={fitRef}>
            <DataTable minWidth={760} dense>
                <thead>
                    <tr>
                        {header('team', 'Team', 'lft stick')}
                        {header('quarter', 'Quarter', 'lft')}
                        {header('startReason', 'Start', 'lft')}
                        {header('playCount', 'Plays')}
                        {header('netYards', 'Net yards')}
                        {header('endBallLocation', 'End', 'lft')}
                        {header('outcome', 'Result', 'lft')}
                        {header('index', 'Score after', 'lft')}
                        <th className="lft">Chart</th>
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map((drive) => (
                        <tr key={drive.index}>
                            <td className="lft stick">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TeamMark team={drive.team === homeTeam ? homeMark : awayMark} size={18} />
                                    {drive.team}
                                </Box>
                            </td>
                            <td className="lft">Q{drive.quarter}</td>
                            <td className="lft">
                                {drive.startReason}
                                <Box sx={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                    {spot(drive.startBallLocation, drive.possession)}
                                </Box>
                            </td>
                            <td>{drive.playCount}</td>
                            <td>{drive.netYards}</td>
                            <td className="lft">{spot(drive.endBallLocation, drive.possession)}</td>
                            <td className="lft">{drive.outcome}</td>
                            <td className="lft">
                                {awayMark?.abbreviation} {drive.awayScoreAfter} - {drive.homeScoreAfter}{' '}
                                {homeMark?.abbreviation}
                            </td>
                            <td className="lft">
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => onViewDrive(drive)}
                                    sx={compact(secondaryButtonSx)}
                                >
                                    View drive chart
                                </Box>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>
            <PagedFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={drives.length}
                onChange={setPage}
                noun="drives"
            />
        </Box>
    );
};

DrivesTable.propTypes = {
    drives: PropTypes.arrayOf(PropTypes.object).isRequired,
    homeTeam: PropTypes.string,
    homeMark: PropTypes.object,
    awayMark: PropTypes.object,
    onViewDrive: PropTypes.func.isRequired,
    initialSort: PropTypes.shape({ key: PropTypes.string, dir: PropTypes.oneOf(['asc', 'desc']) }),
};

export default DrivesTable;
