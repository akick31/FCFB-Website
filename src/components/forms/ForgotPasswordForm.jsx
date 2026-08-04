import React, { useState } from 'react';
import { Box, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { forgotPassword } from '../../api/authApi';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.88rem' };
const btnBaseSx = { border: 0, borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };

const ForgotPasswordForm = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await forgotPassword(email);
            setSuccess(true);
            setEmail('');
        } catch (err) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setError(null);
        setSuccess(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' }}>
                {success ? 'Check your email' : 'Forgot password'}
                <IconButton onClick={handleClose} size="small" aria-label="Close" sx={{ color: 'var(--text-muted)' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            {success ? (
                <>
                    <DialogContent>
                        <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                            We&apos;ve sent a password reset link to your email. Please check your email and click the link to reset your password.
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Box component="button" type="button" onClick={handleClose} sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff' }}>Got it</Box>
                    </DialogActions>
                </>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: '16px' }}>
                            Enter your email address and we&apos;ll send you a link to reset your password.
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

                        <Box component="label" htmlFor="forgotPasswordEmail" sx={labelSx}>Email address</Box>
                        <Box component="input" id="forgotPasswordEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required sx={inputSx} />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Box component="button" type="button" onClick={handleClose} sx={{ ...btnBaseSx, background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text-muted)' }}>Cancel</Box>
                        <Box component="button" type="submit" disabled={loading} sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff' }}>
                            {loading ? 'Sending…' : 'Send reset link'}
                        </Box>
                    </DialogActions>
                </Box>
            )}
        </Dialog>
    );
};

ForgotPasswordForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;
