import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import SegTabs from '../../components/ui/SegTabs';
import TeamMark from '../../components/ui/TeamMark';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getAllUsers } from '../../api/userApi';
import { getAllTeams } from '../../api/teamApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { formatPosition } from '../../utils/formatText';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', font: 'inherit', fontSize: '0.82rem', minWidth: 210, boxSizing: 'border-box' };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const thBtnSx = { background: 'none', border: 0, color: 'inherit', font: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0 };

const transactionColor = (type) => {
    if (type === 'FIRED') return 'var(--live)';
    if (type === 'HIRED_INTERIM') return 'var(--gold)';
    return 'var(--field)';
};

const delayColor = (count) => {
    if (count > 5) return 'var(--live)';
    if (count > 2) return 'var(--gold)';
    return 'var(--field)';
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const SortHeader = ({ label, field, sortField, sortDirection, onSort }) => (
    <Box component="button" type="button" onClick={() => onSort(field)} sx={thBtnSx}>
        {label}
        {sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : <Box component="span" sx={{ opacity: 0.35 }}>▲▼</Box>}
    </Box>
);

SortHeader.propTypes = {
    label: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    sortField: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
    onSort: PropTypes.func.isRequired,
};

const Reports = ({ user }) => {
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const [tab, setTab] = useState('delays');

    const [transactions, setTransactions] = useState([]);
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [transactionError, setTransactionError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('ALL');
    const [positionFilter, setPositionFilter] = useState('ALL');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');

    const [userDelayData, setUserDelayData] = useState([]);
    const [delayLoading, setDelayLoading] = useState(true);
    const [delayError, setDelayError] = useState(null);
    const [delaySearchTerm, setDelaySearchTerm] = useState('');
    const [delayTeamFilter, setDelayTeamFilter] = useState('ALL');
    const [delaySortField, setDelaySortField] = useState('delayInstances');
    const [delaySortDirection, setDelaySortDirection] = useState('desc');

    useEffect(() => {
        if (!user || !user.role) return;
        if (user.role !== 'ADMIN' && user.role !== 'CONFERENCE_COMMISSIONER') navigate('*');
    }, [user, navigate]);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'CONFERENCE_COMMISSIONER') return;
        getEntireCoachTransactionLog()
            .then(setTransactions)
            .catch((err) => { console.error('Failed to fetch transactions:', err); setTransactionError('Failed to load coach transaction log'); })
            .finally(() => setTransactionLoading(false));
    }, [user]);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'CONFERENCE_COMMISSIONER') return;
        Promise.all([getAllUsers(), getAllTeams()])
            .then(([usersResponse, teamsResponse]) => {
                setUserDelayData(usersResponse.map((u) => ({
                    username: u.username,
                    discordTag: u.discord_tag || '-',
                    team: u.team || 'No team',
                    teamLogo: teamsResponse.find((t) => t.name === u.team)?.logo || null,
                    delayInstances: u.delay_of_game_instances,
                })));
            })
            .catch((err) => { console.error('Failed to fetch delay data:', err); setDelayError('Failed to load user delay data'); })
            .finally(() => setDelayLoading(false));
    }, [user]);

    const uniqueTeams = useMemo(() => [...new Set(transactions.map((t) => t.team))].filter(Boolean).sort(), [transactions]);
    const uniquePositions = useMemo(() => [...new Set(transactions.map((t) => t.position))].filter(Boolean).sort(), [transactions]);
    const uniqueTransactionTypes = useMemo(() => [...new Set(transactions.map((t) => t.transaction))].filter(Boolean).sort(), [transactions]);
    const uniqueDelayTeams = useMemo(() => [...new Set(userDelayData.map((u) => u.team))].filter(Boolean).sort(), [userDelayData]);

    const teamOptions = useMemo(() => [{ value: 'ALL', label: 'All teams' }, ...uniqueTeams.map((t) => ({ value: t, label: t }))], [uniqueTeams]);
    const positionOptions = useMemo(() => [{ value: 'ALL', label: 'All positions' }, ...uniquePositions.map((p) => ({ value: p, label: formatPosition(p) }))], [uniquePositions]);
    const typeOptions = useMemo(() => [{ value: 'ALL', label: 'All transactions' }, ...uniqueTransactionTypes.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))], [uniqueTransactionTypes]);
    const delayTeamOptions = useMemo(() => [{ value: 'ALL', label: 'All teams' }, ...uniqueDelayTeams.map((t) => ({ value: t, label: t }))], [uniqueDelayTeams]);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;
        if (teamFilter !== 'ALL') filtered = filtered.filter((t) => t.team === teamFilter);
        if (positionFilter !== 'ALL') filtered = filtered.filter((t) => t.position === positionFilter);
        if (transactionTypeFilter !== 'ALL') filtered = filtered.filter((t) => t.transaction === transactionTypeFilter);
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((t) =>
                t.team?.toLowerCase().includes(searchLower) ||
                t.processed_by?.toLowerCase().includes(searchLower) ||
                (t.coach && t.coach.some((coach) => coach.toLowerCase().includes(searchLower))));
        }
        return filtered;
    }, [transactions, teamFilter, positionFilter, transactionTypeFilter, searchTerm]);

    const filteredUserDelayData = useMemo(() => {
        let filtered = userDelayData;
        if (delayTeamFilter !== 'ALL') filtered = filtered.filter((u) => u.team === delayTeamFilter);
        if (delaySearchTerm) {
            const searchLower = delaySearchTerm.toLowerCase();
            filtered = filtered.filter((u) =>
                u.username?.toLowerCase().includes(searchLower) ||
                u.discordTag?.toLowerCase().includes(searchLower) ||
                u.team?.toLowerCase().includes(searchLower));
        }
        return [...filtered].sort((a, b) => {
            let aValue = a[delaySortField];
            let bValue = b[delaySortField];
            if (typeof aValue === 'string' && typeof bValue === 'string') { aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase(); }
            if (aValue < bValue) return delaySortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return delaySortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [userDelayData, delayTeamFilter, delaySearchTerm, delaySortField, delaySortDirection]);

    const handleDelaySort = (field) => {
        if (delaySortField === field) {
            setDelaySortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setDelaySortField(field);
            setDelaySortDirection('asc');
        }
    };

    if ((transactionLoading || delayLoading)) {
        return (
            <AdminLayout title="Reports">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    if (transactionError || delayError) {
        return (
            <AdminLayout title="Reports">
                <Alert severity="error">{transactionError || delayError}</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Reports"
            controls={<SegTabs value={tab} onChange={setTab} options={[{ value: 'delays', label: 'User delay instances' }, { value: 'transactions', label: 'Coach transaction log' }]} />}
        >
            {tab === 'delays' && (
                <>
                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '16px' }}>
                        <Box component="input" placeholder="Search users..." aria-label="Search users" value={delaySearchTerm} onChange={(e) => setDelaySearchTerm(e.target.value)} sx={searchSx} />
                        <SelectPill label="Team" value={delayTeamFilter} onChange={setDelayTeamFilter} options={delayTeamOptions} sx={pillHeightSx} />
                    </Box>

                    <Panel header="User delay instances" more={`${filteredUserDelayData.length} users`}>
                        <DataTable minWidth={560}>
                            <thead>
                                <tr>
                                    <th className="lft stick"><SortHeader label="Username" field="username" sortField={delaySortField} sortDirection={delaySortDirection} onSort={handleDelaySort} /></th>
                                    <th className="lft"><SortHeader label="Discord tag" field="discordTag" sortField={delaySortField} sortDirection={delaySortDirection} onSort={handleDelaySort} /></th>
                                    <th className="lft"><SortHeader label="Team" field="team" sortField={delaySortField} sortDirection={delaySortDirection} onSort={handleDelaySort} /></th>
                                    <th><SortHeader label="Delay instances" field="delayInstances" sortField={delaySortField} sortDirection={delaySortDirection} onSort={handleDelaySort} /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUserDelayData.map((row) => (
                                    <tr key={row.username}>
                                        <td className="lft stick">@{row.username}</td>
                                        <td className="lft">{row.discordTag}</td>
                                        <td className="lft">
                                            <Box className="teamcell">
                                                {teamsMap[row.team] && <TeamMark team={teamsMap[row.team]} size={20} />}
                                                {row.team}
                                            </Box>
                                        </td>
                                        <td>
                                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: delayColor(row.delayInstances) }}>{row.delayInstances}</Box>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>
                    </Panel>
                </>
            )}

            {tab === 'transactions' && (
                <>
                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '16px' }}>
                        <Box component="input" placeholder="Search transactions..." aria-label="Search transactions" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                        <SelectPill label="Team" value={teamFilter} onChange={setTeamFilter} options={teamOptions} sx={pillHeightSx} />
                        <SelectPill label="Position" value={positionFilter} onChange={setPositionFilter} options={positionOptions} sx={pillHeightSx} />
                        <SelectPill label="Type" value={transactionTypeFilter} onChange={setTransactionTypeFilter} options={typeOptions} sx={pillHeightSx} />
                    </Box>

                    <Panel header="Coach transaction log" more={`${filteredTransactions.length} transactions`}>
                        <DataTable minWidth={720}>
                            <thead>
                                <tr>
                                    <th className="lft stick">Team</th>
                                    <th className="lft">Position</th>
                                    <th className="lft">Coach(es)</th>
                                    <th className="lft">Transaction</th>
                                    <th className="lft">Date</th>
                                    <th className="lft">Processed by</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction, index) => (
                                    <tr key={`${transaction.team}-${transaction.transaction_date}-${index}`}>
                                        <td className="lft stick">{transaction.team || '-'}</td>
                                        <td className="lft">{formatPosition(transaction.position)}</td>
                                        <td className="lft">{Array.isArray(transaction.coach) ? transaction.coach.join(', ') : (transaction.coach || '-')}</td>
                                        <td className="lft">
                                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: transactionColor(transaction.transaction) }}>{transaction.transaction?.replace(/_/g, ' ') || '-'}</Box>
                                        </td>
                                        <td className="lft">{formatDate(transaction.transaction_date)}</td>
                                        <td className="lft">{transaction.processed_by || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>
                    </Panel>
                </>
            )}
        </AdminLayout>
    );
};

Reports.propTypes = { user: PropTypes.object };

export default Reports;
