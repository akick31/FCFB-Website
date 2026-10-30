import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import ConferenceMark from '../../components/ui/ConferenceMark';
import DataTable from '../../components/ui/DataTable';
import Toggle from '../../components/ui/Toggle';
import SelectPill from '../../components/ui/SelectPill';
import PagedFooter from '../../components/ui/PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import ConferenceEditDialog from '../../components/admin/ConferenceEditDialog';
import ConferenceCreateDialog from '../../components/admin/ConferenceCreateDialog';
import { getConferences, setConferenceActive } from '../../api/conferenceApi';
import { getAllTeams } from '../../api/teamApi';
import { refreshConferences } from '../../hooks/useConferencesMap';
import { compact, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const pillHeightSx = { height: '38px', boxSizing: 'border-box' };

const ACTIVE_OPTIONS = [
    { value: 'ALL', label: 'Active + inactive' },
    { value: 'ACTIVE', label: 'Active only' },
    { value: 'INACTIVE', label: 'Inactive only' },
];

const AdminConferences = () => {
    const [conferences, setConferences] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [creating, setCreating] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchParams, setSearchParams] = useSearchParams();
    const editing = searchParams.get('edit');

    const scopeRef = useRef(null);

    const load = useCallback(async (scope) => {
        if (!scope.active) {
            return;
        }
        const request = {};
        scope.request = request;
        setError(null);
        setLoading(true);
        try {
            const [conferences, teams] = await Promise.all([getConferences(), getAllTeams()]);
            if (!scope.active || scope.request !== request) {
                return;
            }
            setConferences([...conferences].sort((a, b) => (a.label || '').localeCompare(b.label || '')));
            setTeams(teams);
        } catch {
            if (scope.active && scope.request === request) {
                setError('Failed to load conferences');
            }
        } finally {
            if (scope.active && scope.request === request) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        load(scope);
        return () => {
            scope.active = false;
        };
    }, [load]);

    const filteredConferences = useMemo(() => {
        if (activeFilter === 'ALL') {
            return conferences;
        }
        return conferences.filter((conference) => (activeFilter === 'ACTIVE' ? conference.active : !conference.active));
    }, [conferences, activeFilter]);
    const [fitRef, pageSize] = useFitCount({ rowHeight: 37, columnWidth: 420, phoneCount: 12 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(filteredConferences, pageSize, activeFilter);

    const teamCountByConference = useMemo(() => {
        const counts = {};
        teams.forEach((team) => {
            if (!team.conference) {
                return;
            }
            counts[team.conference] = (counts[team.conference] || 0) + 1;
        });
        return counts;
    }, [teams]);

    const handleToggleActive = async (conference) => {
        const scope = scopeRef.current;
        setError(null);
        try {
            await setConferenceActive(conference.code, !conference.active);
            refreshConferences();
            await load(scope);
        } catch (err) {
            if (scope.active) {
                setError(err.message || 'Failed to update conference');
            }
        }
    };

    const closeEditor = () => {
        setSearchParams({}, { replace: true });
        load(scopeRef.current);
    };

    const conferenceCreated = () => {
        setCreating(false);
        setSuccess('Conference created');
        load(scopeRef.current);
    };

    if (loading) {
        return (
            <AdminLayout title="Conference Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    const half = Math.ceil(pageRows.length / 2);
    const columns = [pageRows.slice(0, half), pageRows.slice(half)].filter((column) => column.length > 0);

    return (
        <AdminLayout title="Conference Management">
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: '16px' }}>
                    {success}
                </Alert>
            )}

            <Panel
                header="Conferences"
                more={
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <SelectPill
                            label="Status"
                            value={activeFilter}
                            onChange={setActiveFilter}
                            options={ACTIVE_OPTIONS}
                            sx={pillHeightSx}
                        />
                        <Box component="button" type="button" onClick={() => setCreating(true)} sx={primaryButtonSx}>
                            Add conference
                        </Box>
                    </Box>
                }
                sx={{ mb: '16px' }}
            >
                <Box
                    ref={fitRef}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                        gap: '12px',
                        p: { lg: '12px' },
                    }}
                >
                    {columns.map((column, index) => (
                        <Box key={index}>
                            <DataTable minWidth={420} phoneMinWidth={0} tableLayout="fixed" dense>
                                <thead>
                                    <tr>
                                        <th className="lft stick">Conference</th>
                                        <th style={{ textAlign: 'center', width: 64 }}>Teams</th>
                                        <th style={{ textAlign: 'center', width: 70 }}>Active</th>
                                        <th style={{ width: 64 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {column.map((conference) => (
                                        <tr key={conference.code}>
                                            <td className="lft stick">
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    className="teamcell"
                                                    onClick={() => setSearchParams({ edit: conference.code })}
                                                    sx={{
                                                        border: 0,
                                                        background: 'none',
                                                        p: 0,
                                                        font: 'inherit',
                                                        color: 'inherit',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {(conference.logo_url || conference.logo_url_dark) && (
                                                        <ConferenceMark conference={conference.code} size={22} />
                                                    )}
                                                    <span className="nm">{conference.label}</span>
                                                </Box>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {teamCountByConference[conference.code] || 0}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <Toggle
                                                        on={!!conference.active}
                                                        onClick={() => handleToggleActive(conference)}
                                                    />
                                                </Box>
                                            </td>
                                            <td className="lft">
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    onClick={() => setSearchParams({ edit: conference.code })}
                                                    sx={compact(secondaryButtonSx)}
                                                >
                                                    Edit
                                                </Box>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </DataTable>
                        </Box>
                    ))}
                </Box>
                <PagedFooter
                    page={page}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    total={filteredConferences.length}
                    onChange={setPage}
                    noun="conferences"
                />
            </Panel>

            {editing && <ConferenceEditDialog code={editing} open onClose={closeEditor} />}
            <ConferenceCreateDialog open={creating} onClose={() => setCreating(false)} onCreated={conferenceCreated} />
        </AdminLayout>
    );
};

export default AdminConferences;
