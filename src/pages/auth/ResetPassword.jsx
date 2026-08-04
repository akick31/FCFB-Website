import React, { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import { isStrongPassword } from '../../utils/validations';
import PageWrap from '../../components/layout/PageWrap';
import logo from '../../assets/graphics/main_logo.png';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.88rem' };
const btnBaseSx = { width: '100%', border: 0, borderRadius: 'var(--r-sm)', py: '11px', font: 'inherit', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const useQuery = () => new URLSearchParams(useLocation().search);

const ResetPassword = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const userId = query.get('userId');
    const token = query.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordValid, setPasswordValid] = useState(true);

    useEffect(() => {
        if (!userId || !token) {
            navigate('/login');
        }
    }, [userId, token, navigate]);

    if (!userId || !token) {
        return null;
    }

    const handleNewPasswordChange = (event) => {
        const value = event.target.value;
        setNewPassword(value);
        setPasswordValid(isStrongPassword(value));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!passwordValid) {
            setError('Password must be 8-255 characters with at least one special character.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await resetPassword(token, newPassword);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrap>
            <Box sx={{ maxWidth: 400, mx: 'auto', my: '36px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                <Box sx={{ background: 'linear-gradient(160deg, var(--brand-deep), #01293b)', p: '26px', textAlign: 'center' }}>
                    <Box component="img" src={logo} alt="FCFB" sx={{ height: 70 }} />
                </Box>

                <Box sx={{ p: '22px' }}>
                    <Box sx={{ mb: '18px', textAlign: 'center' }}>
                        <Box sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', mb: '4px' }}>Reset password</Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Enter your new password below</Box>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box sx={{ mb: '12px' }}>
                            <Box component="label" htmlFor="resetNewPassword" sx={labelSx}>New password</Box>
                            <Box
                                component="input"
                                id="resetNewPassword"
                                type="password"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                required
                                sx={{ ...inputSx, borderColor: !passwordValid ? 'var(--live)' : 'var(--line)' }}
                            />
                            {!passwordValid && <Box sx={{ mt: '6px', fontSize: '0.7rem', color: 'var(--live)' }}>Must be 8-255 characters with at least one special character</Box>}
                        </Box>

                        <Box sx={{ mb: '12px' }}>
                            <Box component="label" htmlFor="resetConfirmPassword" sx={labelSx}>Confirm password</Box>
                            <Box
                                component="input"
                                id="resetConfirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                                sx={{ ...inputSx, borderColor: confirmPassword && newPassword !== confirmPassword ? 'var(--live)' : 'var(--line)' }}
                            />
                            {confirmPassword !== '' && newPassword !== confirmPassword && <Box sx={{ mt: '6px', fontSize: '0.7rem', color: 'var(--live)' }}>Passwords do not match</Box>}
                        </Box>

                        <Box component="button" type="submit" disabled={loading} sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff' }}>
                            {loading ? 'Resetting…' : 'Reset password'}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '14px', fontSize: '0.76rem' }}>
                            <Box component={Link} to="/login" sx={{ color: 'var(--brand)', cursor: 'pointer', textDecoration: 'none' }}>Back to login</Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </PageWrap>
    );
};

export default ResetPassword;
