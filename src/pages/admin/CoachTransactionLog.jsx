import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { formatPosition } from '../../utils/formatText';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', font: 'inherit', fontSize: '0.82rem', minWidth: 210, boxSizing: 'border-box' };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };

const transactionColor = (type) => {
    if (type === 'FIRED') return 'var(--live)';
    if (type === 'HIRED_INTERIM') return 'var(--gold)';
    return 'var(--field)';
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const CoachTransactionLog = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('ALL');
    const [positionFilter, setPositionFilter] = useState('ALL');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');

    useEffect(() => {
        getEntireCoachTransactionLog()
            .then(setTransactions)
            .catch((err) => { console.error('Failed to fetch transactions:', err); setError('Failed to load coach transaction log'); })
            .finally(() => setLoading(false));
    }, []);

    const uniqueTeams = useMemo(() => [...new Set(transactions.map((t) => t.team))].filter(Boolean).sort(), [transactions]);
    const uniquePositions = useMemo(() => [...new Set(transactions.map((t) => t.position))].filter(Boolean).sort(), [transactions]);
    const uniqueTransactionTypes = useMemo(() => [...new Set(transactions.map((t) => t.transaction))].filter(Boolean).sort(), [transactions]);

    const teamOptions = useMemo(() => [{ value: 'ALL', label: 'All teams' }, ...uniqueTeams.map((t) => ({ value: t, label: t }))], [uniqueTeams]);
    const positionOptions = useMemo(() => [{ value: 'ALL', label: 'All positions' }, ...uniquePositions.map((p) => ({ value: p, label: formatPosition(p) }))], [uniquePositions]);
    const typeOptions = useMemo(() => [{ value: 'ALL', label: 'All transactions' }, ...uniqueTransactionTypes.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))], [uniqueTransactionTypes]);

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

    if (loading) {
        return (
            <AdminLayout title="Coach Transaction Log">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Coach Transaction Log">
                <Alert severity="error">{error}</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Coach Transaction Log"
            controls={(
                <>
                    <Box component="input" placeholder="Search transactions..." aria-label="Search transactions" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                    <SelectPill label="Team" value={teamFilter} onChange={setTeamFilter} options={teamOptions} sx={pillHeightSx} />
                    <SelectPill label="Position" value={positionFilter} onChange={setPositionFilter} options={positionOptions} sx={pillHeightSx} />
                    <SelectPill label="Type" value={transactionTypeFilter} onChange={setTransactionTypeFilter} options={typeOptions} sx={pillHeightSx} />
                </>
            )}
        >
            <Panel header="Transactions" more={`${filteredTransactions.length} transactions`}>
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
        </AdminLayout>
    );
};

export default CoachTransactionLog;
