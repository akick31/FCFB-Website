import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Button, Typography, Alert, Card, CardHeader, CardContent, InputAdornment, IconButton, useTheme
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff, Person, Tag } from "@mui/icons-material";
import { registerUser } from "../../api/authApi";
import { validateEmail, isStrongPassword } from "../../utils/validations";
import FormField from "./FormField";

const RegistrationForm = () => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        username: "",
        coachName: "",
        discordTag: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
        showPassword: false,
    });

    const [validation, setValidation] = useState({
        emailValid: true,
        passwordValid: true,
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
        }
    };

    const handleTogglePassword = () => {
        setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, confirmEmail, password, confirmPassword } = formData;
        const { emailValid, passwordValid } = validation;

        if (!emailValid || !passwordValid) {
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
        <Box sx={theme.root}>
            <Card sx={theme.formCard}>
                <CardHeader
                    title={
                        <Box textAlign="center">
                            <Person fontSize="large" sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                Create an Account
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Join now and start your journey!
                            </Typography>
                        </Box>
                    }
                />
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FormField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Coach Name"
                            name="coachName"
                            value={formData.coachName}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Discord Tag"
                            name="discordTag"
                            value={formData.discordTag}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Tag sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            error={!validation.emailValid}
                            helperText={!validation.emailValid ? "Invalid email address" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Confirm Email"
                            name="confirmEmail"
                            type="email"
                            value={formData.confirmEmail}
                            onChange={handleChange}
                            required
                            error={formData.email !== formData.confirmEmail && formData.confirmEmail !== ""}
                            helperText={formData.confirmEmail !== "" && formData.email !== formData.confirmEmail ? "Emails do not match" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Password"
                            name="password"
                            type={formData.showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            error={!validation.passwordValid}
                            helperText={!validation.passwordValid ? "Must be 8+ chars & include a special character" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end">
                                            {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormField
                            label="Confirm Password"
                            name="confirmPassword"
                            type={formData.showPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ""}
                            helperText={formData.confirmPassword !== "" && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ color: "action.active" }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end">
                                            {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {validation.errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{validation.errorMessage}</Alert>}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: 16 }}
                        >
                            Register
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RegistrationForm;