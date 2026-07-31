import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Alert, Autocomplete, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { getAllTeams, hireCoach, hireInterimCoach, fireSingleCoach } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useConferencesMap, allConferenceList } from '../../components/constants/conferences';
import { isRealTeam, getTeamCoaches } from '../../utils/teamDataUtils';
import { formatPosition } from '../../utils/formatText';
import { currentRosterByTeam } from '../../utils/coachHistory';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', font: 'inherit', fontSize: '0.82rem', minWidth: 200, boxSizing: 'border-box' };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const coachChipSx = { display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', px: '8px', py: '4px', fontSize: '0.76rem', mr: '6px', mb: '4px' };
const fireXSx = { border: 0, background: 'transparent', color: 'var(--live)', cursor: 'pointer', font: 'inherit', fontSize: '0.85rem', lineHeight: 1, p: 0, ml: '2px' };
const hireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '10px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--field)' } };

const CONFERENCE_OPTIONS = () => [{ value: 'ALL', label: 'All conferences' }, ...allConferenceList().filter((c) => c.code !== 'FAKE_TEAM').map((c) => ({ value: c.code, label: c.label }))];
const TAKEN_OPTIONS = [{ value: 'ALL', label: 'All teams' }, { value: 'OPEN', label: 'Open teams' }, { value: 'TAKEN', label: 'Taken teams' }];

const CoachManagement = ({ user }) => {
    useConferencesMap();
    const teamsMap = useTeamsMap();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [roster, setRoster] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [conferenceFilter, setConferenceFilter] = useState('ALL');
    const [takenFilter, setTakenFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const [hireDialogOpen, setHireDialogOpen] = useState(false);
    const [fireTarget, setFireTarget] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [processing, setProcessing] = useState(false);
    const [dialogError, setDialogError] = useState('');

    useEffect(() => {
        if (!user || !user.role) return;
        if (user.role !== 'ADMIN' && user.role !== 'CONFERENCE_COMMISSIONER') navigate('*');
    }, [user, navigate]);

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

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'CONFERENCE_COMMISSIONER') loadData();
    }, [user]);

    const filteredTeams = useMemo(() => {
        let filtered = teams.filter(isRealTeam);
        if (conferenceFilter !== 'ALL') filtered = filtered.filter((team) => team.conference === conferenceFilter);
        if (takenFilter !== 'ALL') {
            filtered = filtered.filter((team) => (takenFilter === 'TAKEN' ? team.is_taken : !team.is_taken));
        }
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((team) => team.name?.toLowerCase().includes(searchLower));
        }
        return filtered;
    }, [teams, conferenceFilter, takenFilter, searchTerm]);

    const rosterFor = (team) => getTeamCoaches(team).map((coach) => ({
        ...coach,
        position: roster[team.name]?.[coach.username]?.position || 'HEAD_COACH',
    }));

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
            <AdminLayout title="Coach Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Coach Management"
            controls={(
                <>
                    <Box component="input" placeholder="Search teams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                    <SelectPill label="Conference" value={conferenceFilter} onChange={setConferenceFilter} options={CONFERENCE_OPTIONS()} sx={pillHeightSx} />
                    <SelectPill label="Status" value={takenFilter} onChange={setTakenFilter} options={TAKEN_OPTIONS} sx={pillHeightSx} />
                </>
            )}
        >
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

            <Panel header="Teams" more={`${filteredTeams.length} teams`}>
                <DataTable minWidth={640}>
                    <thead>
                        <tr>
                            <th className="lft stick">Team</th>
                            <th className="lft">Conference</th>
                            <th className="lft">Coaches</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTeams.map((team) => (
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
                                    <Box component="button" type="button" onClick={() => handleHireCoach(team)} sx={hireBtnSx}>+ Hire</Box>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </Panel>

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

CoachManagement.propTypes = { user: PropTypes.object };

export default CoachManagement;
