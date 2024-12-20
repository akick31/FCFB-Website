import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Container, Select, MenuItem, FormControl, InputLabel, Alert, Paper } from "@mui/material";
import { registerUser } from "../api/authApi";
import { validateEmail, isStrongPassword, validateRedditUsername } from "../utils/validations";
import FormField from "../components/FormField";  // Importing the form field component

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: "",
        coachName: "",
        redditUsername: "",
        discordTag: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
        position: "head_coach",
        showPassword: false,
    });

    const [validation, setValidation] = useState({
        emailValid: true,
        passwordValid: true,
        redditValid: true,
        errorMessage: null,
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "email") {
            setValidation((prev) => ({ ...prev, emailValid: validateEmail(value) }));
        } else if (name === "password") {
            setValidation((prev) => ({ ...prev, passwordValid: isStrongPassword(value) }));
        } else if (name === "redditUsername") {
            setValidation((prev) => ({ ...prev, redditValid: validateRedditUsername(value) }));
        }
    };

    const handleTogglePassword = () => {
        setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, confirmEmail, password, confirmPassword } = formData;
        const { emailValid, passwordValid, redditValid } = validation;

        if (!emailValid || !passwordValid || !redditValid) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Please fix the highlighted errors.",
            }));
            return;
        }

        if (email !== confirmEmail) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Emails do not match.",
            }));
            return;
        }

        if (password !== confirmPassword) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Passwords do not match.",
            }));
            return;
        }

        try {
            await registerUser(formData);
            navigate("/login");
        } catch (error) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Registration failed. Please try again.",
            }));
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Registration
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <FormField label="Username" name="username" value={formData.username} onChange={handleChange} />
                        <FormField label="Coach Name" name="coachName" value={formData.coachName} onChange={handleChange} />

                        <FormField
                            label="Reddit Username"
                            name="redditUsername"
                            value={formData.redditUsername}
                            onChange={handleChange}
                            error={!validation.redditValid}
                            helperText={!validation.redditValid ? "Reddit username cannot contain '/u/'" : ""}
                        />

                        <FormField label="Discord Tag" name="discordTag" value={formData.discordTag} onChange={handleChange} />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="position-label">Position</InputLabel>
                            <Select
                                labelId="position-label"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                label="Position"
                            >
                                <MenuItem value="head_coach">Head Coach</MenuItem>
                                <MenuItem value="coordinator">Coordinator</MenuItem>
                            </Select>
                        </FormControl>

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!validation.emailValid}
                            helperText={!validation.emailValid ? "Invalid email address" : ""}
                        />

                        <FormField
                            label="Confirm Email"
                            name="confirmEmail"
                            type="email"
                            value={formData.confirmEmail}
                            onChange={handleChange}
                            error={formData.email !== formData.confirmEmail && formData.confirmEmail !== ""}
                            helperText={formData.confirmEmail !== "" && formData.email !== formData.confirmEmail ? "Emails do not match" : ""}
                        />

                        <FormField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!validation.passwordValid}
                            helperText={!validation.passwordValid ? "Password must be 8-255 characters with at least one special character" : ""}
                            showPassword={formData.showPassword}
                            handleTogglePassword={handleTogglePassword}
                        />

                        <FormField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ""}
                            helperText={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
                            showPassword={formData.showPassword}
                            handleTogglePassword={handleTogglePassword}
                        />

                        {validation.errorMessage && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {validation.errorMessage}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Register
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default RegistrationForm;