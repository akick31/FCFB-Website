import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import PagedFooter from '../../components/ui/PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import SelectPill from '../../components/ui/SelectPill';
import SegTabs from '../../components/ui/SegTabs';
import TeamName from '../../components/ui/TeamName';
import TeamFilterPill from '../../components/ui/TeamFilterPill';
import CoachTransactionReport from '../../components/reports/CoachTransactionReport';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getUserDelayOfGameInstances } from '../../api/playApi';
import { getAllSeasons, getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';
import { weekLabel } from '../../utils/formatText';

const searchSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    height: '38px',
    font: 'inherit',
    fontSize: '0.82rem',
    minWidth: 210,
    boxSizing: 'border-box',
};
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const pillSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.62rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    px: '8px',
    py: '3px',
    borderRadius: 'var(--r-sm)',
    lineHeight: 1,
};
const thBtnSx = {
    background: 'none',
    border: 0,
    color: 'inherit',
    font: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    textTransform: 'inherit',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: 0,
};

const MAX_WEEK = 13;
const FULL_SEASON = 'full-season';
const DELAY_OF_GAME_REPORT = 'delay-of-game';
const COACH_TRANSACTION_REPORT = 'coach-transactions';

const seasonNumberOf = (entry) => entry.season_number ?? entry.seasonNumber;

const weekCountOf = (entry) => {
    const current = entry.current_week ?? entry.currentWeek;
    if (current == null) {
        return MAX_WEEK;
    }
    return Math.min(Math.max(current, 1), MAX_WEEK);
};

const fallbackWeekCount = (season, period) => {
    if (season !== period?.season || typeof period?.week !== 'number') {
        return MAX_WEEK;
    }
    return period.week;
};

const normalizeWeek = (value) => {
    if (typeof value === 'number') {
        return value;
    }
    return value?.week ?? value?.current_week ?? value?.currentWeek ?? null;
};

const delayColor = (count) => {
    if (count > 5) {
        return 'var(--live)';
    }
    if (count > 2) {
        return 'var(--gold)';
    }
    return 'var(--field)';
};

const SortHeader = ({ label, field, sortField, sortDirection, onSort }) => (
    <Box component="button" type="button" onClick={() => onSort(field)} sx={thBtnSx}>
        {label}
        {sortField === field ? (
            sortDirection === 'asc' ? (
                '▲'
            ) : (
                '▼'
            )
        ) : (
            <Box component="span" sx={{ opacity: 0.35 }}>
                ▲▼
            </Box>
        )}
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
    const [searchParams, setSearchParams] = useSearchParams();

    const updateParam = (key, value, defaultValue) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === defaultValue) {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };

    const report =
        searchParams.get('report') === COACH_TRANSACTION_REPORT ? COACH_TRANSACTION_REPORT : DELAY_OF_GAME_REPORT;
    const setReport = (value) => setSearchParams(new URLSearchParams({ report: value }), { replace: true });

    const [transactions, setTransactions] = useState([]);
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [transactionError, setTransactionError] = useState(null);
    const searchTerm = searchParams.get('q') || '';
    const teamFilter = searchParams.get('team') || 'ALL';
    const positionFilter = searchParams.get('position') || 'ALL';
    const transactionTypeFilter = searchParams.get('type') || 'ALL';

    const [userDelayData, setUserDelayData] = useState([]);
    const [delayLoading, setDelayLoading] = useState(true);
    const [delayError, setDelayError] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [seasonsUnavailable, setSeasonsUnavailable] = useState(false);
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const delaySortField = searchParams.get('sort') || 'delayInstances';
    const delaySortDirection = searchParams.get('dir') || 'desc';

    const seasonParam = searchParams.get('season');
    const weekParam = searchParams.get('week');
    const delaySeason = seasonParam ? Number(seasonParam) : (currentPeriod?.season ?? null);
    const selectedWeek = weekParam ?? (currentPeriod?.week != null ? String(currentPeriod.week) : null);
    const availableWeeks = useMemo(() => {
        const entry = seasons.find((season) => seasonNumberOf(season) === delaySeason);
        const weeks = entry ? weekCountOf(entry) : fallbackWeekCount(delaySeason, currentPeriod);
        return Array.from({ length: weeks }, (_, index) => index + 1);
    }, [seasons, delaySeason, currentPeriod]);
    const weekOutOfRange =
        selectedWeek != null && selectedWeek !== FULL_SEASON && !availableWeeks.includes(Number(selectedWeek));
    const delayWeek = weekOutOfRange ? FULL_SEASON : selectedWeek;

    useEffect(() => {
        if (!user || !user.role) {
            return;
        }
        if (user.role !== 'ADMIN' && user.role !== 'CONFERENCE_COMMISSIONER') {
            navigate('*');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (searchParams.get('report')) {
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.set('report', report);
        setSearchParams(next, { replace: true });
    }, [searchParams, report, setSearchParams]);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'CONFERENCE_COMMISSIONER') {
            return undefined;
        }
        let active = true;
        setTransactionLoading(true);
        setTransactionError(null);
        getEntireCoachTransactionLog()
            .then((loadedTransactions) => {
                if (active) {
                    setTransactions(loadedTransactions);
                }
            })
            .catch(() => {
                if (active) {
                    console.error('Failed to fetch transactions');
                    setTransactionError('Failed to load coach transaction log');
                }
            })
            .finally(() => {
                if (active) {
                    setTransactionLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [user]);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'CONFERENCE_COMMISSIONER') {
            return undefined;
        }
        let active = true;
        setCurrentPeriod(null);
        Promise.all([
            getAllSeasons().catch(() => {
                if (active) {
                    console.error('Failed to fetch seasons');
                }
                return [];
            }),
            getCurrentSeasonOrLatest().catch(() => null),
            getCurrentWeekOrLatest().catch(() => null),
        ]).then(([allSeasons, season, rawWeek]) => {
            if (!active) {
                return;
            }
            const usableSeasons = (allSeasons || []).filter((entry) => seasonNumberOf(entry) != null);
            setSeasonsUnavailable(usableSeasons.length === 0);
            setSeasons(usableSeasons.sort((a, b) => seasonNumberOf(b) - seasonNumberOf(a)));
            const week = normalizeWeek(rawWeek);
            setCurrentPeriod({ season, week: week == null ? FULL_SEASON : Math.min(Math.max(week, 1), MAX_WEEK) });
        });
        return () => {
            active = false;
        };
    }, [user]);

    useEffect(() => {
        if (user?.role !== 'ADMIN' && user?.role !== 'CONFERENCE_COMMISSIONER') {
            return undefined;
        }
        if (delaySeason == null || delayWeek == null) {
            return undefined;
        }
        let active = true;
        setDelayLoading(true);
        getUserDelayOfGameInstances(delaySeason, delayWeek === FULL_SEASON ? null : Number(delayWeek))
            .then((rows) => {
                if (!active) {
                    return;
                }
                setDelayError(null);
                setUserDelayData(
                    (rows || []).map((row) => ({
                        username: row.username,
                        discordTag: row.discord_tag || '-',
                        team: row.team || 'No team',
                        delayInstances: row.delay_of_game_instances,
                    }))
                );
            })
            .catch(() => {
                if (!active) {
                    return;
                }
                console.error('Failed to fetch delay data');
                setDelayError('Failed to load user delay data');
            })
            .finally(() => {
                if (active) {
                    setDelayLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [user, delaySeason, delayWeek]);

    const uniqueDelayTeams = useMemo(
        () => [...new Set(userDelayData.map((u) => u.team))].filter(Boolean).sort(),
        [userDelayData]
    );

    const delaySeasonOptions = useMemo(() => {
        if (seasons.length > 0) {
            return seasons.map((entry) => ({ value: seasonNumberOf(entry), label: `Season ${seasonNumberOf(entry)}` }));
        }
        return delaySeason == null ? [] : [{ value: delaySeason, label: `Season ${delaySeason}` }];
    }, [seasons, delaySeason]);
    const delayWeekOptions = useMemo(
        () => [
            { value: FULL_SEASON, label: 'Full season' },
            ...availableWeeks.map((week) => ({ value: String(week), label: weekLabel(week) })),
        ],
        [availableWeeks]
    );

    const filteredUserDelayData = useMemo(() => {
        let filtered = userDelayData;
        if (teamFilter !== 'ALL') {
            filtered = filtered.filter((u) => u.team === teamFilter);
        }
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.username?.toLowerCase().includes(searchLower) ||
                    u.discordTag?.toLowerCase().includes(searchLower) ||
                    u.team?.toLowerCase().includes(searchLower)
            );
        }
        return [...filtered].sort((a, b) => {
            let aValue = a[delaySortField];
            let bValue = b[delaySortField];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (aValue < bValue) {
                return delaySortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return delaySortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [userDelayData, teamFilter, searchTerm, delaySortField, delaySortDirection]);
    const [delayFitRef, delayPageSize] = useFitCount({ rowHeight: 36 });
    const delayPaging = usePagedRows(
        filteredUserDelayData,
        delayPageSize,
        `${teamFilter}|${searchTerm}|${delayWeek}|${delaySortField}`
    );

    const handleDelaySort = (field) => {
        const next = new URLSearchParams(searchParams);
        if (delaySortField === field) {
            const nextDirection = delaySortDirection === 'asc' ? 'desc' : 'asc';
            if (nextDirection === 'desc') {
                next.delete('dir');
            } else {
                next.set('dir', nextDirection);
            }
        } else {
            next.set('sort', field);
            next.delete('dir');
        }
        setSearchParams(next, { replace: true });
    };

    if (transactionLoading || currentPeriod == null) {
        return (
            <AdminLayout title="Reports">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    if (transactionError) {
        return (
            <AdminLayout title="Reports">
                <Alert severity="error">{transactionError}</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Reports"
            controls={
                <SegTabs
                    value={report}
                    onChange={setReport}
                    options={[
                        { value: DELAY_OF_GAME_REPORT, label: 'User delay instances' },
                        { value: COACH_TRANSACTION_REPORT, label: 'Coach transaction log' },
                    ]}
                />
            }
        >
            {report === DELAY_OF_GAME_REPORT && (
                <>
                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '16px' }}>
                        <Box
                            component="input"
                            placeholder="Search users..."
                            aria-label="Search users"
                            value={searchTerm}
                            onChange={(e) => updateParam('q', e.target.value)}
                            sx={searchSx}
                        />
                        <SelectPill
                            label="Season"
                            value={delaySeason ?? ''}
                            onChange={(value) => updateParam('season', value)}
                            options={delaySeasonOptions}
                            sx={pillHeightSx}
                        />
                        <SelectPill
                            label="Week"
                            value={delayWeek ?? FULL_SEASON}
                            onChange={(value) => updateParam('week', value)}
                            options={delayWeekOptions}
                            sx={pillHeightSx}
                        />
                        <TeamFilterPill
                            value={teamFilter}
                            onChange={(value) => updateParam('team', value, 'ALL')}
                            teams={uniqueDelayTeams.filter((team) => team !== 'No team')}
                        />
                    </Box>

                    {seasonsUnavailable && (
                        <Alert severity="warning" sx={{ mb: '16px' }}>
                            Could not load the season list, so the week options cover the current season only.
                        </Alert>
                    )}

                    {delayError && (
                        <Alert severity="error" sx={{ mb: '16px' }}>
                            {delayError}
                        </Alert>
                    )}

                    <Panel
                        header={
                            delayWeek === FULL_SEASON
                                ? 'User delay instances, full season'
                                : `User delay instances, ${weekLabel(Number(delayWeek))}`
                        }
                        more={`${filteredUserDelayData.length} users`}
                    >
                        <Box ref={delayFitRef}>
                            <DataTable minWidth={560} dense>
                                <thead>
                                    <tr>
                                        <th className="lft stick">
                                            <SortHeader
                                                label="Username"
                                                field="username"
                                                sortField={delaySortField}
                                                sortDirection={delaySortDirection}
                                                onSort={handleDelaySort}
                                            />
                                        </th>
                                        <th className="lft">
                                            <SortHeader
                                                label="Discord tag"
                                                field="discordTag"
                                                sortField={delaySortField}
                                                sortDirection={delaySortDirection}
                                                onSort={handleDelaySort}
                                            />
                                        </th>
                                        <th className="lft">
                                            <SortHeader
                                                label="Team"
                                                field="team"
                                                sortField={delaySortField}
                                                sortDirection={delaySortDirection}
                                                onSort={handleDelaySort}
                                            />
                                        </th>
                                        <th>
                                            <SortHeader
                                                label="Delay instances"
                                                field="delayInstances"
                                                sortField={delaySortField}
                                                sortDirection={delaySortDirection}
                                                onSort={handleDelaySort}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {delayLoading && (
                                        <tr>
                                            <Box component="td" colSpan={4} sx={{ py: 3, textAlign: 'center' }}>
                                                <CircularProgress size={22} />
                                            </Box>
                                        </tr>
                                    )}
                                    {!delayLoading && filteredUserDelayData.length === 0 && (
                                        <tr>
                                            <Box
                                                component="td"
                                                colSpan={4}
                                                sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}
                                            >
                                                No delay of game instances for this{' '}
                                                {delayWeek === FULL_SEASON ? 'season' : 'week'}.
                                            </Box>
                                        </tr>
                                    )}
                                    {!delayLoading &&
                                        delayPaging.pageRows.map((row) => (
                                            <tr key={row.username}>
                                                <td className="lft stick">@{row.username}</td>
                                                <td className="lft">{row.discordTag}</td>
                                                <td className="lft">
                                                    {row.team === 'No team' ? row.team : <TeamName name={row.team} />}
                                                </td>
                                                <td>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            ...pillSx,
                                                            background: 'var(--surface-2)',
                                                            color: delayColor(row.delayInstances),
                                                        }}
                                                    >
                                                        {row.delayInstances}
                                                    </Box>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </DataTable>
                            <PagedFooter
                                page={delayPaging.page}
                                pageCount={delayPaging.pageCount}
                                pageSize={delayPageSize}
                                total={filteredUserDelayData.length}
                                onChange={delayPaging.setPage}
                                noun="users"
                            />
                        </Box>
                    </Panel>
                </>
            )}

            {report === COACH_TRANSACTION_REPORT && (
                <CoachTransactionReport
                    transactions={transactions}
                    filters={{ q: searchTerm, team: teamFilter, position: positionFilter, type: transactionTypeFilter }}
                    onFilterChange={(key, value) => updateParam(key, value, key === 'q' ? '' : 'ALL')}
                />
            )}
        </AdminLayout>
    );
};

Reports.propTypes = { user: PropTypes.object };

export default Reports;
