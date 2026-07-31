import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import CreateTeamForm from '../../components/forms/CreateTeamForm';
import { getAllTeams } from '../../api/teamApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useConferencesMap, allConferenceList } from '../../components/constants/conferences';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', font: 'inherit', fontSize: '0.82rem', minWidth: 200, boxSizing: 'border-box' };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const editBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const createBtnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' };
const toggleChipSx = (on) => ({ display: 'inline-flex', alignItems: 'center', gap: '7px', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', px: '11px', py: '7px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: on ? 'var(--text)' : 'var(--text-muted)' });

const TAKEN_OPTIONS = [{ value: 'ALL', label: 'All teams' }, { value: 'OPEN', label: 'Open teams' }, { value: 'TAKEN', label: 'Taken teams' }];

const statusInfo = (team) => {
    if (!team.active) return { label: 'Inactive', color: 'var(--live)' };
    if (team.is_taken) return { label: 'Taken', color: 'var(--gold)' };
    return { label: 'Open', color: 'var(--field)' };
};

const TeamManagement = () => {
    useConferencesMap();
    const teamsMap = useTeamsMap();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideFakeTeams, setHideFakeTeams] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [conferenceFilter, setConferenceFilter] = useState('ALL');
    const [takenFilter, setTakenFilter] = useState('ALL');
    const [createTeamOpen, setCreateTeamOpen] = useState(false);

    const conferenceOptions = useMemo(
        () => [{ value: 'ALL', label: 'All conferences' }, ...allConferenceList().map((c) => ({ value: c.code, label: c.label }))],
        [],
    );

    const fetchTeams = () => {
        getAllTeams()
            .then(setTeams)
            .catch((err) => { console.error('Failed to fetch teams:', err); setError('Failed to load teams'); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTeams(); }, []);

    const filteredTeams = useMemo(() => {
        let filtered = teams;
        if (hideFakeTeams) filtered = filtered.filter((team) => team.subdivision !== 'FAKE');
        if (conferenceFilter !== 'ALL') filtered = filtered.filter((team) => team.conference === conferenceFilter);
        if (takenFilter !== 'ALL') filtered = filtered.filter((team) => (takenFilter === 'TAKEN' ? team.is_taken : !team.is_taken));
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((team) =>
                team.name?.toLowerCase().includes(searchLower) ||
                team.short_name?.toLowerCase().includes(searchLower) ||
                team.abbreviation?.toLowerCase().includes(searchLower));
        }
        return filtered;
    }, [teams, hideFakeTeams, conferenceFilter, takenFilter, searchTerm]);

    const handleTeamCreated = () => fetchTeams();

    if (loading) {
        return (
            <AdminLayout title="Team Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Team Management"
            controls={(
                <>
                    <Box component="input" placeholder="Search teams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                    <SelectPill label="Conference" value={conferenceFilter} onChange={setConferenceFilter} options={conferenceOptions} sx={pillHeightSx} />
                    <SelectPill label="Status" value={takenFilter} onChange={setTakenFilter} options={TAKEN_OPTIONS} sx={pillHeightSx} />
                    <Box component="button" type="button" onClick={() => setHideFakeTeams((v) => !v)} sx={toggleChipSx(hideFakeTeams)}>
                        <Box component="span" sx={{ width: 14, height: 14, borderRadius: '3px', border: '1.5px solid', borderColor: hideFakeTeams ? 'var(--brand)' : 'var(--text-dim)', background: hideFakeTeams ? 'var(--brand)' : 'transparent' }} />
                        Hide fake teams
                    </Box>
                    <Box component="button" type="button" onClick={() => setCreateTeamOpen(true)} sx={createBtnSx}>+ Create team</Box>
                </>
            )}
        >
            {error && <Box sx={{ color: 'var(--live)', mb: '16px' }}>{error}</Box>}

            <Panel header="Teams" more={`${filteredTeams.length} teams`}>
                <DataTable minWidth={480}>
                    <thead>
                        <tr>
                            <th className="lft stick">Team</th>
                            <th className="lft">Conference</th>
                            <th>Record</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.map((team) => {
                            const status = statusInfo(team);
                            return (
                                <tr key={team.name} onClick={() => navigate(`/admin/edit-team/${team.id}`)}>
                                    <td className="lft stick">
                                        <Box className="teamcell">
                                            <TeamMark team={teamsMap[team.name]} size={22} />
                                            <span className="nm">{team.name}</span>
                                        </Box>
                                    </td>
                                    <td className="lft"><ConferenceMark conference={team.conference} size={20} /></td>
                                    <td className="num">{team.current_wins}-{team.current_losses}</td>
                                    <td>
                                        <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: status.color }}>{status.label}</Box>
                                    </td>
                                    <td>
                                        <Box component="button" type="button" onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit-team/${team.id}`); }} sx={editBtnSx}>Edit</Box>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            </Panel>

            <CreateTeamForm open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} onTeamCreated={handleTeamCreated} />
        </AdminLayout>
    );
};

export default TeamManagement;
