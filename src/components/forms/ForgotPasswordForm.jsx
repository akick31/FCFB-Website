import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    IconButton
} from '@mui/material';
import { Email, Close } from '@mui/icons-material';
import { forgotPassword } from '../../api/authApi';
import StyledButton from '../ui/StyledButton';
import PropTypes from 'prop-types';

const ForgotPasswordForm = ({ open, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
        } catch (error) {
            setError(error.message || 'Failed to send reset email');
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

    const handleSuccessClose = () => {
        setSuccess(false);
        onClose();
    };

    return (
        <>
            {/* Forgot Password Form Dialog */}
            <Dialog 
                open={open && !success} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Forgot Password
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{ mb: 3 }}
                        />
                        
                        <DialogActions sx={{ px: 0, pb: 0 }}>
                            <StyledButton
                                variant="outlined"
                                onClick={handleClose}
                                sx={{ mr: 1 }}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </StyledButton>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog 
                open={success} 
                onClose={handleSuccessClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                        Check Your Email
                    </Typography>
                    <IconButton onClick={handleSuccessClose} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent>
                    <DialogContentText sx={{ mb: 3, fontSize: '1rem' }}>
                        We've sent a password reset link to your email. 
                        Please check your email and click the link to reset your password.
                    </DialogContentText>
                    
                    <DialogActions sx={{ px: 0, pb: 0 }}>
                        <StyledButton
                            onClick={handleSuccessClose}
                            variant="contained"
                        >
                            Got it
                        </StyledButton>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
};

ForgotPasswordForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordForm;


