import React from 'react';
import { Box } from '@mui/material';
import { CheckCircle, Email, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import { useSeo } from '../../hooks/useSeo';

const btnBaseSx = { border: 0, borderRadius: 'var(--r-sm)', py: '11px', px: '18px', font: 'inherit', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' };

const Success = () => {
    const navigate = useNavigate();
    useSeo({ title: 'Registration successful | Fake College Football', description: 'Your Fake College Football coach account has been created.' });

    return (
        <PageWrap>
            <Box sx={{ maxWidth: 460, mx: 'auto', my: '36px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', textAlign: 'center' }}>
                <Box sx={{ background: 'linear-gradient(160deg, var(--brand-deep), #01293b)', p: '30px 26px', textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 56, color: '#fff' }} />
                </Box>

                <Box sx={{ p: '26px' }}>
                    <Box sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text)', mb: '8px' }}>Registration successful!</Box>
                    <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: '20px' }}>Welcome to FCFB! Your account has been created successfully.</Box>

                    <Box sx={{ border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', p: '18px', mb: '20px' }}>
                        <Email sx={{ fontSize: 32, color: 'var(--brand)', mb: '8px' }} />
                        <Box sx={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text)', mb: '6px' }}>Check your email</Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '4px' }}>We&apos;ve sent a verification email to your email account.</Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', fontStyle: 'italic' }}>Don&apos;t forget to check your spam folder!</Box>
                    </Box>

                    <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: '20px' }}>Once you verify your email, you&apos;ll be able to sign in and start playing!</Box>

                    <Box component="button" type="button" onClick={() => navigate('/login')} sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff', mx: 'auto' }}>
                        <ArrowBack sx={{ fontSize: 18 }} /> Back to sign in
                    </Box>
                </Box>
            </Box>
        </PageWrap>
    );
};

export default Success;
