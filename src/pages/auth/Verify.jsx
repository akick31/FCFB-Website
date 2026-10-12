import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import { resendVerificationEmail, verifyEmail } from '../../api/authApi';
import PageWrap from '../../components/layout/PageWrap';
import logo from '../../assets/graphics/main_logo.png';

const btnBaseSx = {
    width: '100%',
    border: 0,
    borderRadius: 'var(--r-sm)',
    py: '11px',
    font: 'inherit',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};

const Verify = () => {
    const location = useLocation();
    const userId = new URLSearchParams(location.search).get('id');

    const [loading, setLoading] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState(null);
    const [resendError, setResendError] = useState(null);
    const requestScopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        requestScopeRef.current = scope;
        setLoading(true);
        setVerificationSuccess(false);
        setResending(false);
        setResendMessage(null);
        setResendError(null);
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const response = await verifyEmail(token);
                if (scope.active) {
                    setVerificationSuccess(Boolean(response));
                }
            } catch {
                if (scope.active) {
                    setVerificationSuccess(false);
                }
            } finally {
                if (scope.active) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => {
            scope.active = false;
        };
    }, [location.search]);

    const handleResendVerification = async () => {
        const scope = requestScopeRef.current;
        setResending(true);
        setResendMessage(null);
        setResendError(null);
        try {
            await resendVerificationEmail(userId);
            if (scope.active) {
                setResendMessage('Verification email has been resent. Please check your email.');
            }
        } catch {
            if (scope.active) {
                setResendError('Error resending verification email. Please try again later.');
            }
        } finally {
            if (scope.active) {
                setResending(false);
            }
        }
    };

    return (
        <PageWrap>
            <Box
                sx={{
                    maxWidth: 400,
                    mx: 'auto',
                    my: '36px',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-lg)',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(160deg, var(--brand-deep), #01293b)',
                        p: '26px',
                        textAlign: 'center',
                    }}
                >
                    <Box component="img" src={logo} alt="FCFB" sx={{ height: 70 }} />
                </Box>

                <Box sx={{ p: '22px', textAlign: 'center' }}>
                    <Box sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', mb: '18px' }}>
                        Email verification
                    </Box>

                    {loading ? (
                        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : verificationSuccess ? (
                        <>
                            <Alert severity="success" sx={{ mb: '16px', textAlign: 'left' }}>
                                Successfully verified user!
                            </Alert>
                            <Box
                                component={Link}
                                to="/login"
                                sx={{
                                    ...btnBaseSx,
                                    background: 'var(--brand-deep)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textDecoration: 'none',
                                }}
                            >
                                Log in
                            </Box>
                        </>
                    ) : (
                        <>
                            <Alert severity="error" sx={{ mb: '16px', textAlign: 'left' }}>
                                Failed to verify email. Please try again.
                            </Alert>
                            {resendMessage && (
                                <Alert severity="success" sx={{ mb: '16px', textAlign: 'left' }}>
                                    {resendMessage}
                                </Alert>
                            )}
                            {resendError && (
                                <Alert severity="error" sx={{ mb: '16px', textAlign: 'left' }}>
                                    {resendError}
                                </Alert>
                            )}
                            <Box
                                component="button"
                                type="button"
                                onClick={handleResendVerification}
                                disabled={resending}
                                sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff' }}
                            >
                                {resending ? 'Sending…' : 'Resend verification email'}
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </PageWrap>
    );
};

export default Verify;
