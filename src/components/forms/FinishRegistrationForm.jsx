import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Button,
    Typography,
    Alert,
    Card,
    CardHeader,
    CardContent,
    CircularProgress,
    InputAdornment,
    IconButton,
    useTheme,
    FormControl,
    InputLabel, Select, MenuItem
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff, Person } from "@mui/icons-material";
import { registerUser } from "../../api/authApi";
import { validateEmail, isStrongPassword } from "../../utils/validations";
import FormField from "./FormField";
import {getOpenTeams} from "../../api/teamApi";
import {validateUser} from "../../api/userApi";

const FinishRegistrationForm = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: "",
        coach_name: "",
        position: "HEAD_COACH",
        offensive_playbook: "FLEXBONE",
        defensive_playbook: "FOUR_THREE",
        discord_tag: "",
        discord_id: "",
        email: "",
        confirm_email: "",
        password: "",
        confirm_password: "",
        show_password: false,
        team_choice_one: "",
        team_choice_two: "",
        team_choice_three: "",
    });

    const [validation, setValidation] = useState({
        emailValid: true,
        passwordValid: true,
        errorMessage: null,
    });

    const [openTeams, setOpenTeams] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const discord_tag = params.get("discordTag");
        const discord_id = params.get("discordId");
        if (discord_tag) {
            setFormData((prev) => ({ ...prev, discord_tag }));
        }
        if (discord_id) {
            setFormData((prev) => ({ ...prev, discord_id }));
        }

        const fetchOpenTeams = async () => {
            try {
                const teams = await getOpenTeams();
                setOpenTeams(teams);
            } catch (error) {
                console.error("Error fetching open teams:", error);
            }
        };
        fetchOpenTeams();
    }, [location.search]);

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
        const { email, confirm_email, password, confirm_password } = formData;
        const { emailValid, passwordValid } = validation;

        if (!emailValid || !passwordValid) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Please fix the highlighted errors.",
            }));
            return;
        }

        if (email !== confirm_email) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Emails do not match.",
            }));
            return;
        }

        if (password !== confirm_password) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Passwords do not match.",
            }));
            return;
        }

        setIsSubmitting(true); // Start loading

        try {
            const validationResponse = await validateUser(formData);

            if (validationResponse.discord_id_exists) {
                setValidation((prev) => ({
                    ...prev,
                    errorMessage: "Discord ID already exists.",
                }));
                return;
            }

            if (validationResponse.discord_username_exists) {
                setValidation((prev) => ({
                    ...prev,
                    errorMessage: "Discord Username already exists.",
                }));
                return;
            }

            if (validationResponse.username_exists) {
                setValidation((prev) => ({
                    ...prev,
                    errorMessage: "Username already exists.",
                }));
                return;
            }

            if (validationResponse.email_exists) {
                setValidation((prev) => ({
                    ...prev,
                    errorMessage: "Email already exists.",
                }));
                return;
            }

            await registerUser({ ...formData });
            navigate("/login");
        } catch (error) {
            setValidation((prev) => ({
                ...prev,
                errorMessage: "Registration failed. Please try again.",
            }));
        } finally {
            setIsSubmitting(false); // Stop loading
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
                                Complete Your Registration
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Finish setting up your account.
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
                            name="coach_name"
                            value={formData.coach_name}
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
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="position-label">Position</InputLabel>
                            <Select
                                labelId="position-label"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                label="Position"
                            >
                                <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                                <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                                <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="team-choice-1-label">Team Choice #1</InputLabel>
                            <Select
                                labelId="team-choice-1-label"
                                name="team_choice_one"
                                value={formData.team_choice_one}
                                onChange={handleChange}
                                label="Team Choice #1"
                            >
                                {openTeams.map((team) => (
                                    <MenuItem key={team} value={team}>
                                        {team}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="team-choice-2-label">Team Choice #2</InputLabel>
                            <Select
                                labelId="team-choice-2-label"
                                name="team_choice_two"
                                value={formData.team_choice_two}
                                onChange={handleChange}
                                label="Team Choice #2"
                            >
                                {openTeams.map((team) => (
                                    <MenuItem key={team} value={team}>
                                        {team}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="team-choice-3-label">Team Choice #3</InputLabel>
                            <Select
                                labelId="team-choice-3-label"
                                name="team_choice_three"
                                value={formData.team_choice_three}
                                onChange={handleChange}
                                label="Team Choice #3"
                            >
                                {openTeams.map((team) => (
                                    <MenuItem key={team} value={team}>
                                        {team}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="offensive-playbook-label">Offensive Playbook</InputLabel>
                            <Select
                                labelId="offensive-playbook-label"
                                name="offensive_playbook"
                                value={formData.offensive_playbook}
                                onChange={handleChange}
                                label="Offensive Playbook"
                            >
                                <MenuItem value="FLEXBONE">Flexbone</MenuItem>
                                <MenuItem value="AIR_RAID">Air Raid</MenuItem>
                                <MenuItem value="PRO">Pro</MenuItem>
                                <MenuItem value="SPREAD">Spread</MenuItem>
                                <MenuItem value="WEST_COAST">West Coast</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="defensive-playbook-label">Defensive Playbook</InputLabel>
                            <Select
                                labelId="defensive-playbook-label"
                                name="defensive_playbook"
                                value={formData.defensive_playbook}
                                onChange={handleChange}
                                label="Defensive Playbook"
                            >
                                <MenuItem value="FOUR_THREE">4-3</MenuItem>
                                <MenuItem value="THREE_FOUR">3-4</MenuItem>
                                <MenuItem value="FIVE_TWO">5-2</MenuItem>
                                <MenuItem value="FOUR_FOUR">4-4</MenuItem>
                                <MenuItem value="THREE_THREE_FIVE">3-3-5</MenuItem>
                            </Select>
                        </FormControl>
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
                            name="confirm_email"
                            type="email"
                            value={formData.confirm_email}
                            onChange={handleChange}
                            required
                            error={formData.email !== formData.confirm_email && formData.confirm_email !== ""}
                            helperText={formData.confirm_email !== "" && formData.email !== formData.confirm_email ? "Emails do not match" : ""}
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
                            name="confirm_password"
                            type={formData.showPassword ? "text" : "password"}
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            error={formData.password !== formData.confirm_password && formData.confirm_password !== ""}
                            helperText={formData.confirm_password !== "" && formData.password !== formData.confirm_password ? "Passwords do not match" : ""}
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
                            disabled={isSubmitting} // Disable the button while submitting
                            sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: 16 }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} sx={{ color: "white" }} /> // Show loading icon
                            ) : (
                                "Complete Registration" // Show button text
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default FinishRegistrationForm;