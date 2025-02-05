import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Box, Button, Typography, Alert, Card, CardHeader, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    InputAdornment, useTheme
} from "@mui/material";
import { Lock, Email, Visibility, VisibilityOff } from "@mui/icons-material";
import { login, forgotPassword } from "../../api/authApi";
import { getUserById } from "../../api/userApi";
import { checkIfUserIsAdmin } from "../../utils/utils";
import FormField from "./FormField";
import PropTypes from "prop-types";

const LoginForm = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    const theme = useTheme();
    const [openForgotPassword, setOpenForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [credentials, setCredentials] = useState({
        usernameOrEmail: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginSuccess = await login(
                credentials.usernameOrEmail,
                credentials.password,
                setIsAuthenticated,
                setUser
            );

            if (loginSuccess) {
                setIsAdmin(checkIfUserIsAdmin());
                const userId = localStorage.getItem("userId");
                const userData = await getUserById(userId);
                setUser(userData);
                navigate("/");
            } else {
                setError("Invalid username/email or password");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message || "An error occurred during login");
            setIsAuthenticated(false);
            setUser({});
        }
    };

    // Toggle password visibility
    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleForgotPassword = async () => {
        try {
            await forgotPassword(resetEmail);
            setOpenForgotPassword(false);
            setError(null);
            alert('Password reset instructions sent to your email');
        } catch (error) {
            setError(error.message || 'Error sending reset email');
        }
    };

    return (
        <Box sx={theme.root}>
            <Card sx={theme.formCard}>
                <CardHeader
                    title={
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Lock fontSize="large" sx={{
                                fontSize: 48,
                                color: 'primary.main',
                                mb: 2
                            }} />
                            <Typography variant="h4" sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                mb: 1
                            }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Please sign in to continue
                            </Typography>
                        </Box>
                    }
                />
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FormField
                            label="Username or Email"
                            name="usernameOrEmail"
                            value={credentials.usernameOrEmail}
                            onChange={handleChange}
                            required
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: 'action.active' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={credentials.password}
                            onChange={handleChange}
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
                                            onClick={handleTogglePassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                            Sign In
                        </Button>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                component={Link}
                                to="/register"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                            >
                                Create Account
                            </Button>
                            <Button
                                onClick={() => setOpenForgotPassword(true)}
                                color="primary"
                                sx={{ ml: 1, fontWeight: 600 }}
                            >
                                Forgot Password?
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            {/* Forgot Password Dialog */}
            <Dialog open={openForgotPassword}
                    onClose={() => setOpenForgotPassword(false)}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 700 }}>
                    Reset Password
                </DialogTitle>
                <DialogContent>
                    <FormField
                        label="Email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Email />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleForgotPassword}
                        variant="contained"
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                    >
                        Send Password Reset
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

LoginForm.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired
}

export default LoginForm;