import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HeadsetIcon from '@mui/icons-material/Headset';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { getNewSignups, deleteNewSignup } from '../../api/newSignupsApi';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { formatPosition, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';

const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };

const actionCardSx = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', p: '18px', textAlign: 'center', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', '&:hover': { transform: 'translateY(-2px)', borderColor: 'color-mix(in srgb, var(--brand) 50%, var(--line))' }, transition: 'transform 0.14s, border-color 0.14s' };

const QUICK_ACTIONS = [
    { label: 'Create game', path: '/admin/game-management', icon: <SportsFootballIcon sx={{ fontSize: 32, color: 'var(--field)' }} /> },
    { label: 'Manage teams', path: '/admin/team-management', icon: <EmojiEventsIcon sx={{ fontSize: 32, color: 'var(--gold)' }} /> },
    { label: 'Manage users', path: '/admin/user-management', icon: <PeopleIcon sx={{ fontSize: 32, color: 'var(--brand)' }} /> },
    { label: 'Manage coaches', path: '/admin/coach-management', icon: <HeadsetIcon sx={{ fontSize: 32, color: 'var(--text-muted)' }} /> },
];

const Admin = ({ user }) => {
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const [newSignups, setNewSignups] = useState([]);
    const [openTeams, setOpenTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearingId, setClearingId] = useState(null);

    useEffect(() => {
        Promise.all([getNewSignups(), getAllTeams()])
            .then(([signups, teams]) => {
                setNewSignups(signups);
                setOpenTeams(teams.filter((team) => !team.is_taken && team.active && isRealTeam(team)));
            })
            .catch((error) => console.error('Failed to load admin dashboard data:', error))
            .finally(() => setLoading(false));
    }, []);

    const handleClearSignup = async (id) => {
        setClearingId(id);
        try {
            await deleteNewSignup(id);
            setNewSignups((prev) => prev.filter((signup) => signup.id !== id));
        } catch (error) {
            console.error('Failed to clear signup:', error);
        } finally {
            setClearingId(null);
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
            <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: '16px' }}>
                Welcome back, {user?.username || 'Admin'}.
            </Box>

            <TileGrid minTile={160} sx={{ mb: '16px' }}>
                <StatTile label="Pending signups" value={newSignups.length} />
                <StatTile label="Open teams" value={openTeams.length} />
            </TileGrid>

            <Panel header="New signups" sx={{ mb: '16px' }}>
                {newSignups.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No pending signups.</Box>
                ) : (
                    <DataTable minWidth={760}>
                        <thead>
                            <tr>
                                <th className="lft stick">Username</th>
                                <th className="lft">Coach</th>
                                <th className="lft">Discord</th>
                                <th className="lft">Position</th>
                                <th className="lft">Team choices</th>
                                <th className="lft">Offense</th>
                                <th className="lft">Defense</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {newSignups.map((signup) => (
                                <tr key={signup.id}>
                                    <td className="lft stick">@{signup.username}</td>
                                    <td className="lft">{signup.coach_name}</td>
                                    <td className="lft">{signup.discord_tag}</td>
                                    <td className="lft">{formatPosition(signup.position)}</td>
                                    <td className="lft">{[signup.team_choice_one, signup.team_choice_two, signup.team_choice_three].filter(Boolean).join(', ')}</td>
                                    <td className="lft">{formatOffensivePlaybook(signup.offensive_playbook)}</td>
                                    <td className="lft">{formatDefensivePlaybook(signup.defensive_playbook)}</td>
                                    <td>
                                        <Box component="span" sx={{ ...pillSx, background: signup.approved ? 'rgba(55,192,125,0.15)' : 'var(--surface-2)', color: signup.approved ? 'var(--field)' : 'var(--text-muted)' }}>
                                            {signup.approved ? 'Approved' : 'Pending'}
                                        </Box>
                                    </td>
                                    <td>
                                        <Box
                                            component="button"
                                            type="button"
                                            disabled={clearingId === signup.id}
                                            onClick={(event) => { event.stopPropagation(); handleClearSignup(signup.id); }}
                                            sx={{ border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '9px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } }}
                                        >
                                            {clearingId === signup.id ? 'Clearing...' : 'Clear'}
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
                            {openTeams.map((team) => (
                                <tr key={team.name} onClick={() => navigate(`/team-details/${teamsMap[team.name]?.id}`)}>
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
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                )}
            </Panel>

            <Panel header="Quick actions">
                <Box sx={{ p: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {QUICK_ACTIONS.map((action) => (
                        <Box key={action.path} onClick={() => navigate(action.path)} sx={actionCardSx}>
                            {action.icon}
                            <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{action.label}</Box>
                        </Box>
                    ))}
                </Box>
            </Panel>
        </AdminLayout>
    );
};

Admin.propTypes = { user: PropTypes.object };

export default Admin;
