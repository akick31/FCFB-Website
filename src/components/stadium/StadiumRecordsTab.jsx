import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';
import PagedFooter from '../ui/PagedFooter';
import SearchInput from '../ui/SearchInput';
import TableMessageRow from '../ui/TableMessageRow';
import TeamName from '../ui/TeamName';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';

const winPct = (record) => {
    const played = record.wins + record.losses;
    return played ? (record.wins / played).toFixed(3).replace(/^0/, '') : '-';
};

const StadiumRecordsTab = ({ records, lead }) => {
    const [query, setQuery] = useState('');
    const shown = useMemo(() => {
        const term = query.trim().toLowerCase();
        return term ? records.filter((record) => record.team.toLowerCase().includes(term)) : records;
    }, [records, query]);
    const [fitRef, pageSize] = useFitCount({ rowHeight: 36, minRows: 5, phoneCount: 8 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(shown, pageSize, query);
    return (
        <Box ref={fitRef}>
            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', p: '10px 12px' }}>
                {lead}
                <SearchInput value={query} onChange={setQuery} placeholder="Search teams" />
            </Box>
            <DataTable minWidth={420} phoneMinWidth={0} tableLayout="fixed" dense>
                <thead>
                    <tr>
                        <th className="lft">Team</th>
                        <th style={{ width: 80 }}>Record</th>
                        <th style={{ width: 70 }}>Pct</th>
                    </tr>
                </thead>
                <tbody>
                    {shown.length === 0 && (
                        <TableMessageRow colSpan={3}>
                            {records.length === 0 ? 'No finished games yet.' : 'No teams match.'}
                        </TableMessageRow>
                    )}
                    {pageRows.map((record) => (
                        <tr key={record.team}>
                            <td className="lft">
                                <TeamName name={record.team} size={18} />
                            </td>
                            <td style={{ fontWeight: 800 }}>
                                {record.wins}–{record.losses}
                            </td>
                            <td>{winPct(record)}</td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>
            <PagedFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={shown.length}
                onChange={setPage}
                noun="teams"
            />
        </Box>
    );
};

StadiumRecordsTab.propTypes = {
    records: PropTypes.arrayOf(
        PropTypes.shape({ team: PropTypes.string.isRequired, wins: PropTypes.number, losses: PropTypes.number })
    ).isRequired,
    lead: PropTypes.node,
};

export default StadiumRecordsTab;
