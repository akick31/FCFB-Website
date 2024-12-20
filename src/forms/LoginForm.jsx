import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Alert, Card, CardHeader, CardContent } from "@mui/material";
import { login } from "../api/authApi";
import { getUserById } from "../api/userApi";
import { checkIfUserIsAdmin } from "../utils/utils";
import FormField from "../components/FormField"; // Import FormField component

const LoginForm = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    const [credentials, setCredentials] = useState({
        usernameOrEmail: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
        if (error) setError(null); // Clear error when user starts typing
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

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "calc(100vh - 100px)",
                padding: 3,
            }}
        >
            <Card
                elevation={3}
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 2,
                }}
            >
                <CardHeader
                    title={
                        <Typography variant="h4" align="center" gutterBottom>
                            Login
                        </Typography>
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
                        />
                        {/* Password field with visibility toggle */}
                        <FormField
                            label="Password"
                            name="password"
                            type="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            showPassword={showPassword}
                            handleTogglePassword={handleTogglePassword}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            sx={{
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: "none",
                            }}
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LoginForm;