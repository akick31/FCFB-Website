import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { getNewSignups, deleteNewSignup, hireFromSignup } from '../../api/newSignupsApi';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam, getTeamCoaches } from '../../utils/teamDataUtils';
import { compact, secondaryButtonSx } from '../../styles/controls';
import TeamName from '../../components/ui/TeamName';
import TeamSelect from '../../components/ui/TeamSelect';
import FormField from '../../components/admin/form/FormField';

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
    const pageScopeRef = useRef(null);
    const hireDialogRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        pageScopeRef.current = scope;
        Promise.all([getNewSignups(), getAllTeams()])
            .then(([signups, allTeams]) => {
                if (scope.active) {
                    setNewSignups(signups);
                    setTeams(allTeams);
                }
            })
            .catch((err) => {
                if (scope.active) {
                    setError(err.message || 'Failed to load admin dashboard data');
                }
            })
            .finally(() => {
                if (scope.active) {
                    setLoading(false);
                }
            });
        return () => {
            scope.active = false;
        };
    }, []);

    const openTeams = useMemo(() => teams.filter((team) => !team.is_taken && team.active && isRealTeam(team)), [teams]);
    const hireableTeams = useMemo(
        () => teams.filter((team) => team.active && isRealTeam(team) && getTeamCoaches(team).length < 2),
        [teams]
    );

    const handleClearSignup = async (id) => {
        const scope = pageScopeRef.current;
        setClearingId(id);
        try {
            await deleteNewSignup(id);
            if (scope.active) {
                setNewSignups((prev) => prev.filter((signup) => signup.id !== id));
            }
        } catch (err) {
            if (scope.active) {
                setError(err.message || 'Failed to clear signup');
            }
        } finally {
            if (scope.active) {
                setClearingId((current) => (current === id ? null : current));
            }
        }
    };

    const handleHireClick = (signup) => {
        hireDialogRef.current = {};
        setHireSignup(signup);
        setHireTeam('');
        setHirePosition('');
        setProcessing(false);
        setDialogError('');
    };

    const closeHireDialog = () => {
        hireDialogRef.current = null;
        setHireSignup(null);
        setProcessing(false);
    };

    const handleHireSubmit = async () => {
        if (!hireTeam || !hirePosition) {
            setDialogError('Please select both a team and position');
            return;
        }
        const scope = pageScopeRef.current;
        const dialog = hireDialogRef.current;
        const signupId = hireSignup.id;
        setProcessing(true);
        setDialogError('');
        try {
            await hireFromSignup({
                signupId,
                team: hireTeam,
                coachPosition: hirePosition,
                processedBy: user?.username,
            });
            if (scope.active) {
                setNewSignups((prev) => prev.filter((signup) => signup.id !== signupId));
                if (hireDialogRef.current === dialog) {
                    closeHireDialog();
                }
            }
        } catch (error) {
            if (scope.active && hireDialogRef.current === dialog) {
                setDialogError(error.message || 'Failed to hire coach');
            }
        } finally {
            if (scope.active && hireDialogRef.current === dialog) {
                setProcessing(false);
            }
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
        <AdminLayout title="Admin dashboard">
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' },
                    gap: '16px',
                    alignItems: 'start',
                }}
            >
                <Panel header="New signups" more={`${newSignups.length} pending`}>
                    {newSignups.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No pending signups.</Box>
                    ) : (
                        <DataTable minWidth={560} phoneMinWidth={0}>
                            <thead>
                                <tr>
                                    <th className="lft">Coach</th>
                                    <th className="lft wide">Team choices</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {newSignups.map((signup) => (
                                    <tr key={signup.id}>
                                        <td className="lft">
                                            <Box sx={{ fontWeight: 700 }}>@{signup.username}</Box>
                                            <Box sx={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                                {signup.coach_name}, {signup.discord_tag}
                                            </Box>
                                        </td>
                                        <td className="lft wide">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                {[
                                                    signup.team_choice_one,
                                                    signup.team_choice_two,
                                                    signup.team_choice_three,
                                                ]
                                                    .filter(Boolean)
                                                    .map((choice) => (
                                                        <TeamName key={choice} name={choice} size={16} />
                                                    ))}
                                            </Box>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <Box
                                                component="span"
                                                sx={{
                                                    ...pillSx,
                                                    background: signup.approved
                                                        ? 'rgba(55,192,125,0.15)'
                                                        : 'var(--surface-2)',
                                                    color: signup.approved ? 'var(--field)' : 'var(--text-muted)',
                                                }}
                                            >
                                                {signup.approved ? 'Verified' : 'Not verified'}
                                            </Box>
                                        </td>
                                        <td>
                                            <Box sx={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleHireClick(signup);
                                                    }}
                                                    sx={compact({ ...secondaryButtonSx, color: 'var(--field)' })}
                                                >
                                                    + Hire
                                                </Box>
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    disabled={clearingId === signup.id}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleClearSignup(signup.id);
                                                    }}
                                                    sx={compact({ ...secondaryButtonSx, color: 'var(--live)' })}
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

                <Panel header="Open teams" more={`${openTeams.length} open`}>
                    {openTeams.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No open teams.</Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                            {openTeams.map((team) => {
                                const teamId = teamsMap[team.name]?.id;
                                return (
                                    <Box
                                        key={team.name}
                                        component={teamId ? Link : 'div'}
                                        to={teamId ? `/team-details/${teamId}` : undefined}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            p: '8px 12px',
                                            borderBottom: '1px solid var(--line-soft)',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            minWidth: 0,
                                            '&:hover': { background: 'var(--surface-2)' },
                                        }}
                                    >
                                        <TeamMark
                                            team={teamsMap[team.name] || { name: team.name }}
                                            size={22}
                                            decorative
                                        />
                                        <Box
                                            component="span"
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                fontWeight: 700,
                                                fontSize: '0.84rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {team.name}
                                        </Box>
                                        <ConferenceMark conference={team.conference} size={18} />
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Panel>
            </Box>

            <Dialog open={Boolean(hireSignup)} onClose={closeHireDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Hire {hireSignup?.coach_name} (@{hireSignup?.username})
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormField label="Team">
                            <TeamSelect
                                value={hireTeam}
                                onChange={setHireTeam}
                                teams={hireableTeams.map((team) => team.name)}
                                ariaLabel="Team"
                                detailOf={(name) => {
                                    const team = hireableTeams.find((entry) => entry.name === name);
                                    return team && getTeamCoaches(team).length > 0
                                        ? '1 coach, hire as coordinator'
                                        : 'Vacant';
                                }}
                            />
                        </FormField>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Coach Position</InputLabel>
                            <Select
                                value={hirePosition}
                                onChange={(e) => setHirePosition(e.target.value)}
                                label="Coach Position"
                            >
                                <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                                <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                                <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                            </Select>
                        </FormControl>
                        {dialogError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {dialogError}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeHireDialog} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleHireSubmit} color="primary" variant="contained" disabled={processing}>
                        Hire Coach
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

Admin.propTypes = { user: PropTypes.object };

export default Admin;
