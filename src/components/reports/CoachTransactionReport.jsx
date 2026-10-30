import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import SegTabs from '../ui/SegTabs';
import SelectPill from '../ui/SelectPill';
import TeamFilterPill from '../ui/TeamFilterPill';
import PagedFooter from '../ui/PagedFooter';
import useFitCount from '../../hooks/useFitCount';
import TransactionFeed from './TransactionFeed';
import TransactionTable from './TransactionTable';
import TeamCoachingHistory from './TeamCoachingHistory';
import { coachesOf, newestFirst, transactionLabel } from './transactionFormat';
import { formatPosition } from '../../utils/formatText';
import { inputSx } from '../../styles/controls';

const ALL = 'ALL';
const pillSx = { height: '38px', boxSizing: 'border-box' };

const optionsFrom = (values, allLabel, format = (value) => value) => [
    { value: ALL, label: allLabel },
    ...[...new Set(values.filter(Boolean))].sort().map((value) => ({ value, label: format(value) })),
];

const matches = (transaction, query) =>
    !query ||
    [transaction.team, transaction.processed_by, ...coachesOf(transaction)].some((value) =>
        value?.toLowerCase().includes(query)
    );

const CoachTransactionReport = ({ transactions, filters, onFilterChange }) => {
    const [view, setView] = useState('feed');
    const [page, setPage] = useState(0);
    const [historyTeam, setHistoryTeam] = useState(null);
    const [fitRef, pageSize] = useFitCount({
        itemSelector: view === 'feed' ? '[data-feed-item]' : 'tbody tr',
        rowHeight: 40,
        phoneCount: 25,
        resetKey: view,
    });

    const filtered = useMemo(() => {
        const query = filters.q.trim().toLowerCase();
        return newestFirst(
            transactions.filter(
                (transaction) =>
                    (filters.team === ALL || transaction.team === filters.team) &&
                    (filters.position === ALL || transaction.position === filters.position) &&
                    (filters.type === ALL || transaction.transaction === filters.type) &&
                    matches(transaction, query)
            )
        );
    }, [transactions, filters]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const shownPage = Math.min(page, pageCount - 1);
    const pageRows = filtered.slice(shownPage * pageSize, (shownPage + 1) * pageSize);

    const changeFilter = (key, value) => {
        setPage(0);
        onFilterChange(key, value);
    };

    return (
        <>
            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '14px', alignItems: 'center' }}>
                <Box
                    component="input"
                    placeholder="Search team, coach or admin"
                    aria-label="Search transactions"
                    value={filters.q}
                    onChange={(event) => changeFilter('q', event.target.value)}
                    sx={{ ...inputSx, width: 240 }}
                />
                <TeamFilterPill
                    value={filters.team}
                    onChange={(value) => changeFilter('team', value)}
                    teams={[...new Set(transactions.map((transaction) => transaction.team).filter(Boolean))]}
                />
                <SelectPill
                    label="Position"
                    value={filters.position}
                    onChange={(value) => changeFilter('position', value)}
                    options={optionsFrom(
                        transactions.map((transaction) => transaction.position),
                        'All positions',
                        formatPosition
                    )}
                    sx={pillSx}
                />
                <SelectPill
                    label="Type"
                    value={filters.type}
                    onChange={(value) => changeFilter('type', value)}
                    options={optionsFrom(
                        transactions.map((transaction) => transaction.transaction),
                        'All types',
                        transactionLabel
                    )}
                    sx={pillSx}
                />
                <Box sx={{ flex: 1 }} />
                <SegTabs
                    value={view}
                    onChange={setView}
                    ariaLabel="View"
                    options={[
                        { value: 'feed', label: 'Feed' },
                        { value: 'table', label: 'Table' },
                    ]}
                />
            </Box>

            <Box ref={fitRef}>
                <Panel header="Coach transactions" more={`${filtered.length.toLocaleString()} total`}>
                    {filtered.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'var(--text-muted)' }}>
                            No transactions match these filters.
                        </Box>
                    ) : view === 'feed' ? (
                        <TransactionFeed transactions={pageRows} onTeamClick={setHistoryTeam} />
                    ) : (
                        <TransactionTable transactions={pageRows} onTeamClick={setHistoryTeam} />
                    )}
                    <PagedFooter
                        page={shownPage}
                        pageCount={pageCount}
                        pageSize={pageSize}
                        total={filtered.length}
                        onChange={setPage}
                        noun="transactions"
                    />
                </Panel>
            </Box>

            <TeamCoachingHistory team={historyTeam} transactions={transactions} onClose={() => setHistoryTeam(null)} />
        </>
    );
};

CoachTransactionReport.propTypes = {
    transactions: PropTypes.array.isRequired,
    filters: PropTypes.shape({
        q: PropTypes.string.isRequired,
        team: PropTypes.string.isRequired,
        position: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

export default CoachTransactionReport;
