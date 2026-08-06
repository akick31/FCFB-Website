import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Alert, Autocomplete, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import CreateTeamForm from '../../components/forms/CreateTeamForm';
import Toggle from '../../components/ui/Toggle';
import { getAllTeams, updateTeam, hireCoach, hireInterimCoach, fireSingleCoach } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useConferencesMap, allConferenceList } from '../../components/constants/conferences';
import { isRealTeam, getTeamCoaches } from '../../utils/teamDataUtils';
import { formatPosition } from '../../utils/formatText';
import { currentRosterByTeam } from '../../utils/coachHistory';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', minWidth: 200 };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const coachChipSx = { display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', px: '8px', py: '4px', fontSize: '0.76rem', mr: '6px', mb: '4px' };
const fireXSx = { border: 0, background: 'transparent', color: 'var(--live)', cursor: 'pointer', font: 'inherit', fontSize: '0.85rem', lineHeight: 1, p: 0, ml: '2px' };
const editBtnSx = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const hireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--field)' } };
const fireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' } };
const pickerRowSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', px: '4px', py: '10px', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } };
const createBtnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' };
const toggleChipSx = (on) => ({ display: 'inline-flex', alignItems: 'center', gap: '7px', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', px: '11px', height: '38px', boxSizing: 'border-box', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: on ? 'var(--text)' : 'var(--text-muted)' });

const TAKEN_OPTIONS = [{ value: 'ALL', label: 'All teams' }, { value: 'OPEN', label: 'Open teams' }, { value: 'TAKEN', label: 'Taken teams' }];
const ACTIVE_OPTIONS = [{ value: 'ALL', label: 'Active + inactive' }, { value: 'ACTIVE', label: 'Active teams' }, { value: 'INACTIVE', label: 'Inactive teams' }];

const statusInfo = (team, active) => {
    if (!active) return { label: 'Inactive', color: 'var(--live)' };
    if (team.is_taken) return { label: 'Taken', color: 'var(--gold)' };
    return { label: 'Open', color: 'var(--field)' };
};

const TeamManagement = ({ user }) => {
    useConferencesMap();
    const teamsMap = useTeamsMap();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [roster, setRoster] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideFakeTeams, setHideFakeTeams] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [conferenceFilter, setConferenceFilter] = useState('ALL');
    const [takenFilter, setTakenFilter] = useState('ALL');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [createTeamOpen, setCreateTeamOpen] = useState(false);
    const [activeOverrides, setActiveOverrides] = useState({});
    const [savingActive, setSavingActive] = useState(false);

    const [hireDialogOpen, setHireDialogOpen] = useState(false);
    const [fireTarget, setFireTarget] = useState(null);
    const [firePickerTeam, setFirePickerTeam] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [processing, setProcessing] = useState(false);
    const [dialogError, setDialogError] = useState('');

    const conferenceOptions = useMemo(
        () => [{ value: 'ALL', label: 'All conferences' }, ...allConferenceList().map((c) => ({ value: c.code, label: c.label }))],
        [],
    );

    const loadData = async () => {
        try {
            const [teamsResponse, usersResponse, transactions] = await Promise.all([
                getAllTeams(),
                getAllUsers(),
                getEntireCoachTransactionLog(),
            ]);
            setTeams(teamsResponse);
            setUsers(usersResponse);
            setRoster(currentRosterByTeam(transactions));
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const effectiveActive = (team) => activeOverrides[team.name] ?? team.active;

    const filteredTeams = useMemo(() => {
        let filtered = teams;
        if (hideFakeTeams) filtered = filtered.filter(isRealTeam);
        if (conferenceFilter !== 'ALL') filtered = filtered.filter((team) => team.conference === conferenceFilter);
        if (takenFilter !== 'ALL') filtered = filtered.filter((team) => (takenFilter === 'TAKEN' ? team.is_taken : !team.is_taken));
        if (activeFilter !== 'ALL') {
            filtered = filtered.filter(isRealTeam);
            filtered = filtered.filter((team) => (activeFilter === 'ACTIVE' ? effectiveActive(team) : !effectiveActive(team)));
        }
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((team) =>
                team.name?.toLowerCase().includes(searchLower) ||
                team.short_name?.toLowerCase().includes(searchLower) ||
                team.abbreviation?.toLowerCase().includes(searchLower));
        }
        return filtered;
    }, [teams, hideFakeTeams, conferenceFilter, takenFilter, activeFilter, activeOverrides, searchTerm]);

    const rosterFor = (team) => getTeamCoaches(team).map((coach) => ({
        ...coach,
        position: roster[team.name]?.[coach.username]?.position || 'HEAD_COACH',
    }));

    const handleTeamCreated = () => loadData();

    const handleToggleActive = (team) => {
        if (!isRealTeam(team)) return;
        setActiveOverrides((prev) => {
            const next = { ...prev };
            const newValue = !effectiveActive(team);
            if (newValue === team.active) delete next[team.name];
            else next[team.name] = newValue;
            return next;
        });
    };

    const pendingActiveCount = Object.keys(activeOverrides).length;

    const handleSaveActive = async () => {
        if (pendingActiveCount === 0) return;
        setSavingActive(true);
        setError(null);
        try {
            await Promise.all(Object.entries(activeOverrides).map(([name, active]) => {
                const team = teams.find((entry) => entry.name === name);
                return updateTeam({ ...team, active });
            }));
            setActiveOverrides({});
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to save team status changes');
        } finally {
            setSavingActive(false);
        }
    };

    const handleFireClick = (team) => {
        const roster = rosterFor(team);
        if (roster.length === 1) {
            setFireTarget({ team, coach: roster[0] });
        } else if (roster.length > 1) {
            setFirePickerTeam(team);
        }
    };

    const handleHireCoach = (team) => {
        setSelectedTeam(team);
        setSelectedUser(null);
        setSelectedPosition('');
        setDialogError('');
        setHireDialogOpen(true);
    };

    const handleHireSubmit = async () => {
        if (!selectedUser || !selectedPosition) {
            setDialogError('Please select both a user and position');
            return;
        }
        setProcessing(true);
        setDialogError('');
        try {
            if (!selectedUser.discord_id) {
                setDialogError('Selected user does not have a Discord ID');
                return;
            }
            await hireCoach({ team: selectedTeam.name, discordId: selectedUser.discord_id, coachPosition: selectedPosition, processedBy: user.username });
            setHireDialogOpen(false);
            await loadData();
        } catch (err) {
            setDialogError(err.message || 'Failed to hire coach');
        } finally {
            setProcessing(false);
        }
    };

    const handleHireInterimSubmit = async () => {
        if (!selectedUser) {
            setDialogError('Please select a user');
            return;
        }
        setProcessing(true);
        setDialogError('');
        try {
            if (!selectedUser.discord_id) {
                setDialogError('Selected user does not have a Discord ID');
                return;
            }
            await hireInterimCoach({ team: selectedTeam.name, discordId: selectedUser.discord_id, processedBy: user.username });
            setHireDialogOpen(false);
            await loadData();
        } catch (err) {
            setDialogError(err.message || 'Failed to hire interim coach');
        } finally {
            setProcessing(false);
        }
    };

    const handleFireSubmit = async () => {
        if (!fireTarget) return;
        setProcessing(true);
        setDialogError('');
        try {
            await fireSingleCoach({ team: fireTarget.team.name, discordId: fireTarget.coach.discordId, coachPosition: fireTarget.coach.position, processedBy: user.username });
            setFireTarget(null);
            await loadData();
        } catch (err) {
            setDialogError(err.message || 'Failed to fire coach');
        } finally {
            setProcessing(false);
        }
    };

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
                    <Box component="input" placeholder="Search teams..." aria-label="Search teams" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                    <SelectPill label="Conference" value={conferenceFilter} onChange={setConferenceFilter} options={conferenceOptions} sx={pillHeightSx} />
                    <SelectPill label="Status" value={takenFilter} onChange={setTakenFilter} options={TAKEN_OPTIONS} sx={pillHeightSx} />
                    <SelectPill label="Active" value={activeFilter} onChange={setActiveFilter} options={ACTIVE_OPTIONS} sx={pillHeightSx} />
                    <Box component="button" type="button" onClick={() => setHideFakeTeams((v) => !v)} sx={toggleChipSx(hideFakeTeams)}>
                        <Box component="span" sx={{ width: 14, height: 14, borderRadius: '3px', border: '1.5px solid', borderColor: hideFakeTeams ? 'var(--brand)' : 'var(--text-dim)', background: hideFakeTeams ? 'var(--brand)' : 'transparent' }} />
                        Hide fake teams
                    </Box>
                    <Box component="button" type="button" onClick={() => setCreateTeamOpen(true)} sx={createBtnSx}>+ Create team</Box>
                    <Box component="button" type="button" onClick={handleSaveActive} disabled={pendingActiveCount === 0 || savingActive} sx={{ ...createBtnSx, background: 'var(--field)', '&:disabled': { opacity: 0.5, cursor: 'default' } }}>
                        {savingActive ? 'Saving...' : pendingActiveCount > 0 ? `Save status changes (${pendingActiveCount})` : 'Save status changes'}
                    </Box>
                </>
            )}
        >
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

            <Panel header="Teams" more={`${filteredTeams.length} teams`}>
                <DataTable minWidth={900}>
                    <thead>
                        <tr>
                            <th className="lft stick">Team</th>
                            <th className="lft">Conference</th>
                            <th className="lft">Coaches</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Active</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.map((team) => {
                            const status = statusInfo(team, effectiveActive(team));
                            return (
                                <tr key={team.name}>
                                    <td className="lft stick">
                                        <Box className="teamcell">
                                            <TeamMark team={teamsMap[team.name]} size={22} />
                                            <span className="nm">{team.name}</span>
                                        </Box>
                                    </td>
                                    <td className="lft"><ConferenceMark conference={team.conference} size={20} /></td>
                                    <td className="lft">
                                        {rosterFor(team).length === 0 ? (
                                            <Box component="span" sx={{ color: 'var(--text-dim)' }}>Vacant</Box>
                                        ) : (
                                            rosterFor(team).map((coach) => (
                                                <Box key={coach.username} component="span" sx={coachChipSx}>
                                                    {coach.name}
                                                    <Box component="button" type="button" title={`Fire ${coach.name}`} onClick={() => setFireTarget({ team, coach })} sx={fireXSx}>&times;</Box>
                                                </Box>
                                            ))
                                        )}
                                    </td>
                                    <td>
                                        <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: status.color }}>{status.label}</Box>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Toggle on={effectiveActive(team)} onClick={() => handleToggleActive(team)} disabled={!isRealTeam(team)} />
                                        </Box>
                                    </td>
                                    <td>
                                        <Box sx={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            {rosterFor(team).length > 0 && (
                                                <Box component="button" type="button" onClick={() => handleFireClick(team)} sx={fireBtnSx}>Fire</Box>
                                            )}
                                            {rosterFor(team).length < 2 && (
                                                <Box component="button" type="button" onClick={() => handleHireCoach(team)} sx={hireBtnSx}>+ Hire</Box>
                                            )}
                                            <Box component={Link} to={`/admin/edit-team/${team.id}`} sx={editBtnSx}>Edit</Box>
                                        </Box>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            </Panel>

            <CreateTeamForm open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} onTeamCreated={handleTeamCreated} />

            <Dialog open={hireDialogOpen} onClose={() => setHireDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Hire Coach for {selectedTeam?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Autocomplete
                            options={users}
                            getOptionLabel={(option) => option.username}
                            value={selectedUser}
                            onChange={(event, newValue) => setSelectedUser(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Select User" placeholder="Start typing to search users..." fullWidth sx={{ mb: 2 }} />
                            )}
                            filterOptions={(options, { inputValue }) => {
                                const filterValue = inputValue.toLowerCase();
                                return options.filter((option) => option.username.toLowerCase().includes(filterValue));
                            }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Coach Position</InputLabel>
                            <Select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} label="Coach Position">
                                <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                                <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                                <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                            </Select>
                        </FormControl>
                        {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHireDialogOpen(false)} disabled={processing}>Cancel</Button>
                    <Button onClick={handleHireInterimSubmit} color="warning" variant="contained" disabled={processing}>Hire Interim Coach</Button>
                    <Button onClick={handleHireSubmit} color="primary" variant="contained" disabled={processing}>Hire Coach</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(firePickerTeam)} onClose={() => setFirePickerTeam(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Fire which coach from {firePickerTeam?.name}?</DialogTitle>
                <DialogContent>
                    {firePickerTeam && rosterFor(firePickerTeam).map((coach) => (
                        <Box key={coach.username} sx={pickerRowSx}>
                            <Box>
                                <Box sx={{ fontWeight: 700 }}>{coach.name}</Box>
                                <Box sx={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatPosition(coach.position)}</Box>
                            </Box>
                            <Box
                                component="button"
                                type="button"
                                onClick={() => { setFireTarget({ team: firePickerTeam, coach }); setFirePickerTeam(null); }}
                                sx={fireBtnSx}
                            >
                                Fire
                            </Box>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFirePickerTeam(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(fireTarget)} onClose={() => setFireTarget(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Fire {fireTarget?.coach.name} from {fireTarget?.team.name}?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to fire {fireTarget?.coach.name} ({formatPosition(fireTarget?.coach.position)}) from {fireTarget?.team.name}? This action cannot be undone.
                    </Typography>
                    {dialogError && <Alert severity="error" sx={{ mt: 2 }}>{dialogError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFireTarget(null)} disabled={processing}>Cancel</Button>
                    <Button onClick={handleFireSubmit} color="error" variant="contained" disabled={processing}>Fire Coach</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

TeamManagement.propTypes = { user: PropTypes.object };

export default TeamManagement;
