import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import PagedFooter from '../../components/ui/PagedFooter';
import TeamName from '../../components/ui/TeamName';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import { inputSx } from '../../styles/controls';
import TeamUniformThumb from '../../components/admin/TeamUniformThumb';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';

const THUMB_VIEWS = ['HELMET', 'SECONDARY_HELMET', 'JERSEY', 'AWAY_JERSEY'];

const AdminTeamAppearance = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        let active = true;
        getAllTeams()
            .then((loaded) => {
                if (active) {
                    setTeams(loaded.filter(isRealTeam).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err.message || 'Failed to load teams');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) {
            return teams;
        }
        return teams.filter((team) => (team.name || '').toLowerCase().includes(term));
    }, [teams, query]);
    const [fitRef, pageSize] = useFitCount({
        itemSelector: 'a',
        rowHeight: 114,
        minRows: 2,
        columnWidth: 240,
        phoneCount: 8,
    });
    const { page, pageCount, pageRows, setPage } = usePagedRows(filtered, pageSize, query);

    return (
        <AdminLayout title="Team appearance">
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}
            <Panel
                header={`Teams (${filtered.length})`}
                more={
                    <Box
                        component="input"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search teams"
                        aria-label="Search teams"
                        sx={{ ...inputSx, width: 220, height: '32px' }}
                    />
                }
            >
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box ref={fitRef}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                                gap: '10px',
                                p: '12px',
                            }}
                        >
                            {pageRows.map((team) => (
                                <Box
                                    key={team.name}
                                    component={Link}
                                    to={`/team-appearance/${team.id}`}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        p: '10px',
                                        border: '1px solid var(--line)',
                                        borderRadius: 'var(--r-md, 10px)',
                                        background: 'var(--surface-2)',
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        '&:hover': { borderColor: 'var(--brand)' },
                                    }}
                                >
                                    <TeamName
                                        name={team.name}
                                        size={22}
                                        sx={{ fontWeight: 700, fontSize: '0.84rem' }}
                                    />
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                        {THUMB_VIEWS.map((view) => (
                                            <TeamUniformThumb key={view} team={team.name} view={view} height={52} />
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                            {filtered.length === 0 && (
                                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', p: '16px' }}>
                                    No teams match.
                                </Box>
                            )}
                        </Box>
                        <PagedFooter
                            page={page}
                            pageCount={pageCount}
                            pageSize={pageSize}
                            total={filtered.length}
                            onChange={setPage}
                            noun="teams"
                        />
                    </Box>
                )}
            </Panel>
        </AdminLayout>
    );
};

export default AdminTeamAppearance;
