import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { login } from '../../api/authApi';
import { getUserById } from '../../api/userApi';
import { checkIfUserIsAdmin } from '../../utils/utils';
import ForgotPasswordForm from './ForgotPasswordForm';
import logo from '../../assets/graphics/main_logo.png';
import { clickableProps } from '../../utils/a11y';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.88rem' };
const btnBaseSx = { width: '100%', border: 0, borderRadius: 'var(--r-sm)', py: '11px', font: 'inherit', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const LoginForm = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [discordError, setDiscordError] = useState('');
    const [forgotOpen, setForgotOpen] = useState(false);

    useEffect(() => {
        const discordToken = searchParams.get('discordToken');
        const discordUserId = searchParams.get('discordUserId');
        if (!discordToken || !discordUserId) return;

        const completeDiscordLogin = async () => {
            try {
                localStorage.setItem('token', discordToken);
                localStorage.setItem('userId', discordUserId);
                const discordRole = searchParams.get('discordRole');
                if (discordRole) localStorage.setItem('role', discordRole);
                else localStorage.removeItem('role');

                const userData = await getUserById(discordUserId);
                setIsAuthenticated(true);
                setUser(userData);
                setIsAdmin(checkIfUserIsAdmin());
                navigate('/');
            } catch {
                setDiscordError('Discord sign-in failed. Please try again.');
                const next = new URLSearchParams(searchParams);
                next.delete('discordToken');
                next.delete('discordUserId');
                next.delete('discordRole');
                setSearchParams(next, { replace: true });
            }
        };

        completeDiscordLogin();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const success = await login(usernameOrEmail, password, setIsAuthenticated, setUser);
            if (success) {
                setIsAdmin(checkIfUserIsAdmin());
                navigate('/');
            } else {
                setError('Invalid username/email or password');
            }
        } catch {
            setError('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscordOAuth = () => {
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_BASE_URL;
        if (!clientId) {
            setDiscordError('Discord sign-in is not configured yet. Use your username and password below.');
            return;
        }
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    };

    return (
        <>
            <Box sx={{ maxWidth: 400, mx: 'auto', my: '36px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <Box sx={{ background: 'linear-gradient(160deg, var(--brand-deep), #01293b)', p: '26px', textAlign: 'center' }}>
                    <Box component="img" src={logo} alt="FCFB" sx={{ height: 70 }} />
                </Box>

                <Box sx={{ p: '22px' }}>
                    {discordError && <Alert severity="warning" sx={{ mb: '16px' }}>{discordError}</Alert>}

                    <Box component="button" type="button" onClick={handleDiscordOAuth} sx={{ ...btnBaseSx, background: 'var(--disc, #5865F2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                        <FontAwesomeIcon icon={faDiscord} /> Log in with Discord
                    </Box>

                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', my: '16px',
                        '&::before, &::after': { content: '""', flex: 1, height: '1px', background: 'var(--line)' },
                    }}>
                        or
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: '12px' }}>
                            <Box component="label" htmlFor="loginUsername" sx={labelSx}>Username or email</Box>
                            <Box component="input" id="loginUsername" placeholder="Username" value={usernameOrEmail} onChange={(event) => setUsernameOrEmail(event.target.value)} required sx={inputSx} />
                        </Box>
                        <Box sx={{ mb: '12px' }}>
                            <Box component="label" htmlFor="loginPassword" sx={labelSx}>Password</Box>
                            <Box component="input" id="loginPassword" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required sx={inputSx} />
                        </Box>

                        <Box component="button" type="submit" disabled={loading} sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff' }}>
                            {loading ? 'Signing in…' : 'Log in'}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '14px', fontSize: '0.76rem' }}>
                            <Box component="span" {...clickableProps(() => setForgotOpen(true))} sx={{ color: 'var(--brand)', cursor: 'pointer' }}>Forgot password?</Box>
                            <Box component={Link} to="/register" sx={{ color: 'var(--brand)', cursor: 'pointer', textDecoration: 'none' }}>Create account</Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <ForgotPasswordForm open={forgotOpen} onClose={() => setForgotOpen(false)} />
        </>
    );
};

LoginForm.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default LoginForm;
