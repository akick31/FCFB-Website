import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import BackButton from '../../components/ui/BackButton';
import Panel from '../../components/ui/Panel';
import TeamMark from '../../components/ui/TeamMark';
import TeamUniformThumb from '../../components/admin/TeamUniformThumb';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';

const searchSx = { width: '100%', maxWidth: 320, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const openSx = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '32px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const AdminTeamAppearance = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        getAllTeams()
            .then((loaded) => setTeams(loaded.filter(isRealTeam).sort((a, b) => (a.name || '').localeCompare(b.name || ''))))
            .catch((err) => setError(err.message || 'Failed to load teams'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return teams;
        return teams.filter((team) => (team.name || '').toLowerCase().includes(term));
    }, [teams, query]);

    return (
        <AdminLayout
            title="Team appearance"
            controls={<Box component="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teams" sx={searchSx} />}
        >
            <BackButton onBack={() => navigate(-1)} />
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}><CircularProgress /></Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                    {filtered.map((team) => (
                        <Panel key={team.name}>
                            <Box sx={{ p: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <TeamMark team={team} size={26} />
                                    <Box sx={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name}</Box>
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <TeamUniformThumb team={team.name} view="HELMET" height={88} />
                                    <TeamUniformThumb team={team.name} view="SECONDARY_HELMET" height={88} />
                                    <TeamUniformThumb team={team.name} view="UNIFORM" height={88} />
                                    <TeamUniformThumb team={team.name} view="AWAY_UNIFORM" height={88} />
                                </Box>
                                <Box component={Link} to={`/team-appearance/${team.id}`} sx={openSx}>Open editor</Box>
                            </Box>
                        </Panel>
                    ))}
                    {filtered.length === 0 && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', p: '16px' }}>No teams match.</Box>}
                </Box>
            )}
        </AdminLayout>
    );
};

export default AdminTeamAppearance;
