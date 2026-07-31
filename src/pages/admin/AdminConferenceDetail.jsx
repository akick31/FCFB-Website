import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import { getConferences } from '../../api/conferenceApi';
import { getAllTeams, updateTeam } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '6px', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', minWidth: 200 };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const backSx = { color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', mb: '14px' };

const AdminConferenceDetail = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [conferences, setConferences] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movingTeam, setMovingTeam] = useState(null);
    const [addTeamName, setAddTeamName] = useState('');
    const [adding, setAdding] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const [confList, allTeams] = await Promise.all([getConferences(), getAllTeams()]);
            setConferences(confList);
            setTeams(allTeams);
        } catch (err) {
            setError('Failed to load conference data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [code]);

    const conference = conferences.find((c) => c.code === code);
    const teamsInConference = useMemo(
        () => teams.filter((team) => team.conference === code).sort((a, b) => a.name.localeCompare(b.name)),
        [teams, code],
    );
    const availableTeams = useMemo(
        () => teams.filter((team) => team.conference !== code && team.active && isRealTeam(team)).sort((a, b) => a.name.localeCompare(b.name)),
        [teams, code],
    );

    const moveTeamToConference = async (team, newConference) => {
        setError(null);
        setMovingTeam(team.name);
        try {
            await updateTeam({ ...team, conference: newConference });
            await load();
        } catch (err) {
            setError(err.message || `Failed to update ${team.name}`);
        } finally {
            setMovingTeam(null);
        }
    };

    const handleAddTeam = async (event) => {
        event.preventDefault();
        if (!addTeamName) return;
        const team = teams.find((t) => t.name === addTeamName);
        if (!team) return;
        setAdding(true);
        setError(null);
        try {
            await updateTeam({ ...team, conference: code });
            setAddTeamName('');
            await load();
        } catch (err) {
            setError(err.message || `Failed to add ${team.name}`);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Conference">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={conference ? conference.label : code}>
            <Box component={Link} to="/admin/conferences" sx={backSx}>&larr; All conferences</Box>

            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

            {!conference && (
                <Alert severity="warning" sx={{ mb: '16px' }}>No conference found for code &quot;{code}&quot;.</Alert>
            )}

            <Panel header={`Teams in ${conference ? conference.label : code}`} more={`${teamsInConference.length} teams`} sx={{ mb: '16px' }}>
                {teamsInConference.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No teams currently assigned to this conference.</Box>
                ) : (
                    <DataTable minWidth={480}>
                        <thead>
                            <tr>
                                <th className="lft stick">Team</th>
                                <th className="lft">Conference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamsInConference.map((team) => (
                                <tr key={team.name}>
                                    <td className="lft stick" onClick={() => navigate(`/team-details/${team.id}`)} style={{ cursor: 'pointer' }}>
                                        <span className="nm">{team.name}</span>
                                    </td>
                                    <td className="lft">
                                        <Box
                                            component="select"
                                            value={team.conference || ''}
                                            disabled={movingTeam === team.name}
                                            onChange={(event) => moveTeamToConference(team, event.target.value)}
                                            sx={selectSx}
                                        >
                                            {conferences.map((c) => (
                                                <option key={c.code} value={c.code}>{c.label}{!c.active ? ' (inactive)' : ''}</option>
                                            ))}
                                        </Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                )}
            </Panel>

            <Panel header="Add a team to this conference">
                <Box component="form" onSubmit={handleAddTeam} sx={{ p: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box component="select" value={addTeamName} onChange={(event) => setAddTeamName(event.target.value)} sx={selectSx}>
                        <option value="">Select a team...</option>
                        {availableTeams.map((team) => (
                            <option key={team.name} value={team.name}>{team.name}</option>
                        ))}
                    </Box>
                    <Box component="button" type="submit" disabled={!addTeamName || adding} sx={btnSx}>
                        {adding ? 'Adding...' : 'Add team'}
                    </Box>
                </Box>
            </Panel>
        </AdminLayout>
    );
};

export default AdminConferenceDetail;
