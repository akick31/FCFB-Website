import React, { useState } from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import {
    Box,
    Button,
    Typography,
    Alert,
    Card,
    CardContent,
    CardHeader,
    InputAdornment,
    IconButton,
    useTheme
} from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import FormField from "../components/forms/FormField";
import { isStrongPassword } from "../utils/validations";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ResetPassword = () => {
    const theme = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [passwordValid, setPasswordValid] = useState(true);
    const query = useQuery();
    const userId = query.get("userId");
    const token = query.get("token");

    const navigate = useNavigate();

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        setPasswordValid(isStrongPassword(value)); // Validate password strength
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordValid) {
            setError("Password must be 8-255 characters with at least one special character.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await resetPassword(userId, token, newPassword);
            navigate('/login');
        } catch (error) {
            setError(error.message || 'Password reset failed');
        }
    };

    return (
        <Box sx={theme.root}>
            <Card sx={theme.formCard}>
                <CardHeader
                    title={
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Lock fontSize="large" sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                                Reset Password
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Enter your new password below
                            </Typography>
                        </Box>
                    }
                />
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FormField
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            error={!passwordValid}
                            helperText={!passwordValid ? "Password must be 8-255 characters with at least one special character" : ""}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={newPassword !== confirmPassword && confirmPassword !== ""}
                            helperText={confirmPassword !== "" && newPassword !== confirmPassword ? "Passwords do not match" : ""}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: 16
                            }}
                        >
                            Reset Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResetPassword;