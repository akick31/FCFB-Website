import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import useProfileAccount from '../../hooks/useProfileAccount';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../context/ColorModeContext';
import { formatPosition } from '../../utils/formatText';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import Toggle from '../../components/ui/Toggle';
import TeamMark from '../../components/ui/TeamMark';
import ApiKeyPanel from '../../components/user/ApiKeyPanel';
import { useSeo } from '../../hooks/useSeo';
import { rowSx, lblSx, descSx, ctrlSx } from '../../components/user/profileStyles';
import FieldRow from '../../components/user/FieldRow';
import PasswordRow from '../../components/user/PasswordRow';
import DiscordRow from '../../components/user/DiscordRow';
import PastUsernamesRow from '../../components/user/PastUsernamesRow';

const Profile = ({ user, setUser, setIsAuthenticated, setIsAdmin }) => {
    const teamsMap = useTeamsMap();
    const { mode, setMode } = useColorMode();
    const { saveCoachName, saveUsername, saveEmail, savePassword, saveDelayOfGameWarningOptOut, handleLogout } =
        useProfileAccount({
            user,
            setUser,
            setIsAuthenticated,
            setIsAdmin,
        });
    useSeo({
        title: 'Profile | FCFB',
        description: 'Manage your Fake College Football account, settings, and API access.',
    });
    if (!user) {
        return (
            <PageWrap>
                <PageHeading eyebrow="Your account" title="Profile" />
                <Panel>
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                        You need to{' '}
                        <Box component={Link} to="/login" sx={{ color: 'var(--brand)' }}>
                            log in
                        </Box>{' '}
                        to manage your account.
                    </Box>
                </Panel>
            </PageWrap>
        );
    }

    return (
        <PageWrap>
            <PageHeading eyebrow="Your account" title="Profile & settings" />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px' }}>
                <Box>
                    <Panel key={`profile-${user.id}`} header="Profile">
                        <Box sx={rowSx}>
                            <TeamMark team={user.team ? teamsMap[user.team] : null} size={44} />
                            <Box>
                                <Box sx={lblSx}>@{user.username}</Box>
                                <Box sx={descSx}>
                                    {formatPosition(user.position)}
                                    {user.team ? `, ${user.team}` : ', Free agent'}
                                </Box>
                            </Box>
                        </Box>
                        <FieldRow
                            label="Coach name"
                            desc={user.coach_name || 'Set your coach name'}
                            onSave={saveCoachName}
                        />
                        <FieldRow label="Username" desc={user.username} onSave={saveUsername} />
                        <PastUsernamesRow userId={user.id} />
                        <FieldRow label="Email" type="email" desc="Change your account email" onSave={saveEmail} />
                        <PasswordRow onSave={savePassword} />
                        <DiscordRow user={user} />
                        <Box sx={rowSx}>
                            <Box>
                                <Box sx={lblSx}>First delay of game warning</Box>
                                <Box sx={descSx}>Get pinged for the first warning. The second warning always sends</Box>
                            </Box>
                            <Box sx={{ ml: 'auto' }}>
                                <Toggle
                                    on={!user.delay_of_game_warning_opt_out}
                                    onClick={() => saveDelayOfGameWarningOptOut(!user.delay_of_game_warning_opt_out)}
                                />
                            </Box>
                        </Box>
                        {user.team && (
                            <Box sx={rowSx}>
                                <Box>
                                    <Box sx={lblSx}>Team appearance</Box>
                                    <Box sx={descSx}>Edit your uniform and home field</Box>
                                </Box>
                                <Box
                                    component={Link}
                                    to={`/team-appearance/${teamsMap[user.team]?.id}`}
                                    sx={{
                                        ...ctrlSx,
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    Open editor
                                </Box>
                            </Box>
                        )}
                    </Panel>

                    <ApiKeyPanel key={user.id} />
                </Box>

                <Box>
                    <Panel header="Appearance">
                        <Box sx={rowSx}>
                            <Box>
                                <Box sx={lblSx}>Theme</Box>
                                <Box sx={descSx}>Dark or light</Box>
                            </Box>
                            <Box
                                sx={{
                                    ml: 'auto',
                                    display: 'inline-flex',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--r-sm)',
                                    overflow: 'hidden',
                                }}
                            >
                                {['light', 'dark'].map((option) => (
                                    <Box
                                        key={option}
                                        component="button"
                                        onClick={() => setMode(option)}
                                        sx={{
                                            border: 0,
                                            borderRight: option === 'light' ? '1px solid var(--line-soft)' : 0,
                                            background: mode === option ? 'var(--brand-deep)' : 'var(--surface)',
                                            color: mode === option ? '#fff' : 'var(--text-muted)',
                                            font: 'inherit',
                                            fontSize: '0.78rem',
                                            fontWeight: 700,
                                            px: '15px',
                                            py: '8px',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {option}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Panel>

                    <Panel header="Session" sx={{ mt: '16px' }}>
                        <Box sx={rowSx}>
                            <Box>
                                <Box sx={lblSx}>Signed in</Box>
                                <Box sx={descSx}>This device</Box>
                            </Box>
                            <Box
                                component="button"
                                onClick={handleLogout}
                                sx={{
                                    ...ctrlSx,
                                    color: 'var(--live)',
                                    borderColor: 'color-mix(in srgb, var(--live) 40%, var(--line))',
                                }}
                            >
                                Log out
                            </Box>
                        </Box>
                    </Panel>
                </Box>
            </Box>
        </PageWrap>
    );
};

Profile.propTypes = {
    user: PropTypes.object,
    setUser: PropTypes.func,
    setIsAuthenticated: PropTypes.func,
    setIsAdmin: PropTypes.func,
};

export default Profile;
