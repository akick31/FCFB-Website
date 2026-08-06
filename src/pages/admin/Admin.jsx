import React, { useState, useEffect, useMemo } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { getNewSignups, deleteNewSignup, hireFromSignup } from '../../api/newSignupsApi';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam, getTeamCoaches } from '../../utils/teamDataUtils';

const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };

const hireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--field)' } };

const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const QUICK_ACTIONS = [
    { label: 'Create game', path: '/admin/game-management', icon: <SportsFootballIcon sx={{ fontSize: 15 }} /> },
    { label: 'Manage teams', path: '/admin/team-management', icon: <EmojiEventsIcon sx={{ fontSize: 15 }} /> },
    { label: 'Manage users', path: '/admin/user-management', icon: <PeopleIcon sx={{ fontSize: 15 }} /> },
    { label: 'Manage conferences', path: '/admin/conferences', icon: <AccountTreeIcon sx={{ fontSize: 15 }} /> },
];

const Admin = ({ user }) => {
    const teamsMap = useTeamsMap();
    const [newSignups, setNewSignups] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearingId, setClearingId] = useState(null);

    const [hireSignup, setHireSignup] = useState(null);
    const [hireTeam, setHireTeam] = useState('');
    const [hirePosition, setHirePosition] = useState('');
    const [processing, setProcessing] = useState(false);
    const [dialogError, setDialogError] = useState('');

    useEffect(() => {
        Promise.all([getNewSignups(), getAllTeams()])
            .then(([signups, allTeams]) => {
                setNewSignups(signups);
                setTeams(allTeams);
            })
            .catch((err) => setError(err.message || 'Failed to load admin dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    const openTeams = useMemo(() => teams.filter((team) => !team.is_taken && team.active && isRealTeam(team)), [teams]);
    const hireableTeams = useMemo(
        () => teams.filter((team) => team.active && isRealTeam(team) && getTeamCoaches(team).length < 2),
        [teams],
    );

    const handleClearSignup = async (id) => {
        setClearingId(id);
        try {
            await deleteNewSignup(id);
            setNewSignups((prev) => prev.filter((signup) => signup.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to clear signup');
        } finally {
            setClearingId(null);
        }
    };

    const handleHireClick = (signup) => {
        setHireSignup(signup);
        setHireTeam('');
        setHirePosition('');
        setDialogError('');
    };

    const handleHireSubmit = async () => {
        if (!hireTeam || !hirePosition) {
            setDialogError('Please select both a team and position');
            return;
        }
        setProcessing(true);
        setDialogError('');
        try {
            await hireFromSignup({ signupId: hireSignup.id, team: hireTeam, coachPosition: hirePosition, processedBy: user?.username });
            setNewSignups((prev) => prev.filter((signup) => signup.id !== hireSignup.id));
            setHireSignup(null);
        } catch (error) {
            setDialogError(error.message || 'Failed to hire coach');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Admin dashboard">
                <Box sx={{ p: 4, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Admin dashboard"
            controls={(
                <>
                    {QUICK_ACTIONS.map((action) => (
                        <Box key={action.path} component={Link} to={action.path} sx={ctrlSx}>
                            {action.icon}
                            {action.label}
                        </Box>
                    ))}
                </>
            )}
        >
            <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: '16px' }}>
                Welcome back, {user?.username || 'Admin'}.
            </Box>

            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

            <TileGrid minTile={160} sx={{ mb: '16px' }}>
                <StatTile label="Pending signups" value={newSignups.length} />
                <StatTile label="Open teams" value={openTeams.length} />
            </TileGrid>

            <Panel header="New signups" sx={{ mb: '16px' }}>
                {newSignups.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No pending signups.</Box>
                ) : (
                    <DataTable minWidth={620}>
                        <thead>
                            <tr>
                                <th className="lft stick">Username</th>
                                <th className="lft">Coach</th>
                                <th className="lft">Discord</th>
                                <th className="lft">Team choices</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {newSignups.map((signup) => (
                                <tr key={signup.id}>
                                    <td className="lft stick">@{signup.username}</td>
                                    <td className="lft">{signup.coach_name}</td>
                                    <td className="lft">{signup.discord_tag}</td>
                                    <td className="lft">{[signup.team_choice_one, signup.team_choice_two, signup.team_choice_three].filter(Boolean).join(', ')}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Box component="span" sx={{ ...pillSx, background: signup.approved ? 'rgba(55,192,125,0.15)' : 'var(--surface-2)', color: signup.approved ? 'var(--field)' : 'var(--text-muted)' }}>
                                            {signup.approved ? 'Verified' : 'Not verified'}
                                        </Box>
                                    </td>
                                    <td>
                                        <Box sx={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            <Box component="button" type="button" onClick={(event) => { event.stopPropagation(); handleHireClick(signup); }} sx={hireBtnSx}>+ Hire</Box>
                                            <Box
                                                component="button"
                                                type="button"
                                                disabled={clearingId === signup.id}
                                                onClick={(event) => { event.stopPropagation(); handleClearSignup(signup.id); }}
                                                sx={{ border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } }}
                                            >
                                                {clearingId === signup.id ? 'Clearing...' : 'Clear'}
                                            </Box>
                                        </Box>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                )}
            </Panel>

            <Panel header="Open teams" sx={{ mb: '16px' }}>
                {openTeams.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No open teams.</Box>
                ) : (
                    <DataTable minWidth={480}>
                        <thead>
                            <tr>
                                <th className="lft stick">Team</th>
                                <th className="lft">Conference</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {openTeams.map((team) => {
                                const teamId = teamsMap[team.name]?.id;
                                return (
                                <Box
                                    component={teamId ? Link : 'tr'}
                                    to={teamId ? `/team-details/${teamId}` : undefined}
                                    key={team.name}
                                    sx={{ display: 'table-row', textDecoration: 'none', color: 'inherit', cursor: teamId ? 'pointer' : 'default' }}
                                >
                                    <td className="lft stick">
                                        <Box className="teamcell">
                                            <TeamMark team={teamsMap[team.name]} size={22} />
                                            <span className="nm">{team.name}</span>
                                        </Box>
                                    </td>
                                    <td className="lft"><ConferenceMark conference={team.conference} size={20} /></td>
                                    <td>
                                        <Box component="span" sx={{ ...pillSx, background: 'transparent', color: 'var(--field)', border: '1px solid color-mix(in srgb, var(--field) 55%, var(--line))' }}>Open</Box>
                                    </td>
                                </Box>
                                );
                            })}
                        </tbody>
                    </DataTable>
                )}
            </Panel>

            <Dialog open={Boolean(hireSignup)} onClose={() => setHireSignup(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Hire {hireSignup?.coach_name} (@{hireSignup?.username})</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Team</InputLabel>
                            <Select value={hireTeam} onChange={(e) => setHireTeam(e.target.value)} label="Team">
                                {hireableTeams.map((team) => {
                                    const coachCount = getTeamCoaches(team).length;
                                    return (
                                        <MenuItem key={team.name} value={team.name}>
                                            {team.name} {coachCount === 0 ? '(vacant)' : '(1 coach, hire as coordinator)'}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Coach Position</InputLabel>
                            <Select value={hirePosition} onChange={(e) => setHirePosition(e.target.value)} label="Coach Position">
                                <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                                <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                                <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                            </Select>
                        </FormControl>
                        {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHireSignup(null)} disabled={processing}>Cancel</Button>
                    <Button onClick={handleHireSubmit} color="primary" variant="contained" disabled={processing}>Hire Coach</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

Admin.propTypes = { user: PropTypes.object };

export default Admin;
