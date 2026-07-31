import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { CheckCircle } from '@mui/icons-material';
import logo from '../../assets/graphics/main_logo.png';

const btnBaseSx = { width: '100%', border: 0, borderRadius: 'var(--r-sm)', py: '11px', font: 'inherit', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const FEATURES = [
    'Join a Discord community of college football fans',
    'Guess numbers to call plays',
    'Experience full seasons with weekly polls, bowl games, and playoffs',
    'Fill that football void when the season ends',
];

const RegistrationForm = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDiscordOAuth = () => {
        setLoading(true);
        const clientId = import.meta.env.VITE_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_BASE_URL;
        if (!clientId) {
            setError('Discord sign-up is not configured yet. Check back soon.');
            setLoading(false);
            return;
        }
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', my: '36px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(160deg, var(--brand-deep), #01293b)', p: '26px', textAlign: 'center' }}>
                <Box component="img" src={logo} alt="FCFB" sx={{ height: 70 }} />
            </Box>

            <Box sx={{ p: '22px' }}>
                <Box sx={{ mb: '18px', textAlign: 'center' }}>
                    <Box sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', mb: '4px' }}>Create your account</Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Join the FCFB community with your Discord account</Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

                <Box component="button" type="button" onClick={handleDiscordOAuth} disabled={loading} sx={{ ...btnBaseSx, background: 'var(--disc, #5865F2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                    <FontAwesomeIcon icon={faDiscord} /> {loading ? 'Connecting…' : 'Continue with Discord'}
                </Box>

                <Box sx={{ mt: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {FEATURES.map((feature) => (
                        <Box key={feature} sx={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                            <CheckCircle sx={{ fontSize: 16, color: 'var(--brand)', mt: '2px', flexShrink: 0 }} />
                            <Box sx={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{feature}</Box>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: '18px', fontSize: '0.76rem' }}>
                    Already have an account?&nbsp;<Box component={Link} to="/login" sx={{ color: 'var(--brand)', cursor: 'pointer', textDecoration: 'none', fontWeight: 700 }}>Sign in</Box>
                </Box>
            </Box>
        </Box>
    );
};

export default RegistrationForm;
