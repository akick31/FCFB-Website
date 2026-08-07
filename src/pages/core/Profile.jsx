import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import { updateUsername, updateEmail, updatePassword, updateCoachName, getUserById } from '../../api/userApi';
import { logout } from '../../api/authApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../theme/ColorModeContext';
import { formatPosition } from '../../utils/formatText';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import TeamMark from '../../components/ui/TeamMark';
import ApiKeyPanel from '../../components/user/ApiKeyPanel';
import { useSeo } from '../../hooks/useSeo';

const rowSx = { display: 'flex', alignItems: 'center', gap: '14px', px: 2, py: '14px', borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap', '&:last-of-type': { borderBottom: 0 } };
const lblSx = { fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' };
const descSx = { color: 'var(--text-dim)', fontSize: '0.74rem' };
const ctrlSx = { ml: 'auto', minWidth: '76px', textAlign: 'center', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '9px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.88rem' };
const primarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' };

const FieldRow = ({ label, desc, type = 'text', onSave }) => {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const save = async () => {
        setSaving(true);
        setError('');
        try {
            await onSave(draft);
            setOpen(false);
            setDraft('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
            <Box sx={{ ...rowSx, borderBottom: 0 }}>
                <Box>
                    <Box sx={lblSx}>{label}</Box>
                    <Box sx={descSx}>{desc}</Box>
                </Box>
                <Box component="button" sx={ctrlSx} onClick={() => { setOpen((v) => !v); setError(''); }}>{open ? 'Cancel' : 'Change'}</Box>
            </Box>
            {open && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box component="input" type={type} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`New ${label.toLowerCase()}`} sx={{ ...inputSx, flex: '1 1 220px' }} />
                    <Box component="button" onClick={save} disabled={saving || !draft} sx={primarySx}>{saving ? 'Saving…' : 'Save'}</Box>
                    {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
                </Box>
            )}
        </Box>
    );
};

FieldRow.propTypes = { label: PropTypes.string.isRequired, desc: PropTypes.string, type: PropTypes.string, onSave: PropTypes.func.isRequired };

const PasswordRow = ({ onSave }) => {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const save = async () => {
        setSaving(true);
        setError('');
        try {
            await onSave(current, next);
            setOpen(false);
            setCurrent('');
            setNext('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
            <Box sx={{ ...rowSx, borderBottom: 0 }}>
                <Box>
                    <Box sx={lblSx}>Password</Box>
                    <Box sx={descSx}>Update your account password</Box>
                </Box>
                <Box component="button" sx={ctrlSx} onClick={() => { setOpen((v) => !v); setError(''); }}>{open ? 'Cancel' : 'Update'}</Box>
            </Box>
            {open && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box component="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" sx={{ ...inputSx, flex: '1 1 180px' }} />
                    <Box component="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password" sx={{ ...inputSx, flex: '1 1 180px' }} />
                    <Box component="button" onClick={save} disabled={saving || !current || !next} sx={primarySx}>{saving ? 'Saving…' : 'Save'}</Box>
                    {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
                </Box>
            )}
        </Box>
    );
};

PasswordRow.propTypes = { onSave: PropTypes.func.isRequired };

const DiscordRow = ({ user }) => {
    const [notice, setNotice] = useState('');

    const handleLink = () => {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_BASE_URL;
        const token = localStorage.getItem('token');
        if (!clientId || !token) {
            setNotice('Discord sign-in is not configured yet.');
            return;
        }
        const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify&state=${encodeURIComponent(token)}`;
        window.location.href = discordOAuthUrl;
    };

    return (
        <Box sx={rowSx}>
            <Box>
                <Box sx={lblSx}>Discord</Box>
                <Box sx={descSx}>{user.discord_id ? `Linked${user.discord_tag ? ` as ${user.discord_tag}` : ''}` : 'Not linked'}</Box>
                {notice && <Box sx={{ ...descSx, color: 'var(--gold)', mt: 0.5 }}>{notice}</Box>}
            </Box>
            <Box component="button" sx={ctrlSx} onClick={handleLink}>{user.discord_id ? 'Relink' : 'Link Discord account'}</Box>
        </Box>
    );
};

DiscordRow.propTypes = { user: PropTypes.object.isRequired };

const Profile = ({ user, setUser }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const teamsMap = useTeamsMap();
    const { mode, setMode } = useColorMode();
    useSeo({ title: 'Profile & settings | Fake College Football', description: 'Manage your Fake College Football account, settings, and API access.' });

    useEffect(() => {
        if (!user?.id) return;
        const linked = searchParams.get('discordLinked');
        const discordError = searchParams.get('discordError');
        if (!linked && !discordError) return;
        if (linked) {
            getUserById(user.id).then((fresh) => {
                setUser?.((prev) => ({ ...prev, discord_id: fresh.discord_id, discord_tag: fresh.discord_tag }));
            }).catch(() => {});
        }
        const next = new URLSearchParams(searchParams);
        next.delete('discordLinked');
        next.delete('discordError');
        setSearchParams(next, { replace: true });
    }, [user?.id]);

    if (!user) {
        return (
            <PageWrap>
                <PageHeading eyebrow="Your account" title="Profile & settings" />
                <Panel><Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>You need to <Box component={Link} to="/login" sx={{ color: 'var(--brand)' }}>log in</Box> to manage your account.</Box></Panel>
            </PageWrap>
        );
    }

    const patch = (updates) => setUser?.((prev) => ({ ...prev, ...updates }));

    const handleLogout = async () => {
        await logout(() => {}, setUser, () => {}).catch(() => {});
        window.location.assign('/');
    };

    return (
        <PageWrap>
            <PageHeading eyebrow="Your account" title="Profile & settings" />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px' }}>
                <Box>
                    <Panel header="Profile">
                        <Box sx={rowSx}>
                            <TeamMark team={user.team ? teamsMap[user.team] : null} size={44} />
                            <Box>
                                <Box sx={lblSx}>@{user.username}</Box>
                                <Box sx={descSx}>{formatPosition(user.position)}{user.team ? `, ${user.team}` : ', Free agent'}</Box>
                            </Box>
                        </Box>
                        <FieldRow label="Coach name" desc={user.coach_name || 'Set your coach name'} onSave={async (value) => { await updateCoachName(user.id, value); patch({ coach_name: value }); }} />
                        <FieldRow label="Username" desc={user.username} onSave={async (value) => { await updateUsername(user.id, value); patch({ username: value }); }} />
                        <FieldRow label="Email" type="email" desc="Change your account email" onSave={async (value) => { await updateEmail(user.id, value); }} />
                        <PasswordRow onSave={(current, next) => updatePassword(user.id, current, next)} />
                        <DiscordRow user={user} />
                    </Panel>

                    <ApiKeyPanel />
                </Box>

                <Box>
                    <Panel header="Appearance">
                        <Box sx={rowSx}>
                            <Box>
                                <Box sx={lblSx}>Theme</Box>
                                <Box sx={descSx}>Dark or light</Box>
                            </Box>
                            <Box sx={{ ml: 'auto', display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                                {['light', 'dark'].map((option) => (
                                    <Box
                                        key={option}
                                        component="button"
                                        onClick={() => setMode(option)}
                                        sx={{ border: 0, borderRight: option === 'light' ? '1px solid var(--line-soft)' : 0, background: mode === option ? 'var(--brand-deep)' : 'var(--surface)', color: mode === option ? '#fff' : 'var(--text-muted)', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, px: '15px', py: '8px', cursor: 'pointer', textTransform: 'capitalize' }}
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
                            <Box component="button" onClick={handleLogout} sx={{ ...ctrlSx, color: 'var(--live)', borderColor: 'color-mix(in srgb, var(--live) 40%, var(--line))' }}>Log out</Box>
                        </Box>
                    </Panel>
                </Box>
            </Box>
        </PageWrap>
    );
};

Profile.propTypes = { user: PropTypes.object, setUser: PropTypes.func };

export default Profile;
