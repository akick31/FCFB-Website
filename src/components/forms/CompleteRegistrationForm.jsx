import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Grid,
    Typography,
    Alert,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    InputAdornment,
    IconButton,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { 
    Email, 
    Lock, 
    Visibility, 
    VisibilityOff, 
    Person,
    SportsFootball,
    School
} from "@mui/icons-material";
import { registerUser } from "../../api/authApi";
import { validateEmail, isStrongPassword } from "../../utils/validations";
import { getOpenTeams } from "../../api/teamApi";
import { validateUser } from "../../api/userApi";
import StyledCard from "../ui/StyledCard";
import StyledButton from "../ui/StyledButton";

const CompleteRegistrationForm = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
        teamChoicesValid: true,
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
                console.log("Fetched open teams:", teams);
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

        // Clear error message when user starts typing
        if (validation.errorMessage) {
            setValidation((prev) => ({ ...prev, errorMessage: null }));
        }
    };

    const handleTogglePassword = () => {
        setFormData((prev) => ({ ...prev, show_password: !prev.show_password }));
    };

    const validateTeamChoices = () => {
        const { team_choice_one, team_choice_two, team_choice_three } = formData;
        
        // Must have at least one team choice
        if (!team_choice_one && !team_choice_two && !team_choice_three) {
            return false;
        }
        
        // No duplicate teams
        const choices = [team_choice_one, team_choice_two, team_choice_three].filter(Boolean);
        const uniqueChoices = new Set(choices);
        
        return choices.length === uniqueChoices.size;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, confirm_email, password, confirm_password } = formData;
        const { emailValid, passwordValid } = validation;

        // Validate team choices
        const teamChoicesValid = validateTeamChoices();
        setValidation((prev) => ({ ...prev, teamChoicesValid }));

        if (!emailValid || !passwordValid || !teamChoicesValid) {
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

        setIsSubmitting(true);

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
            setIsSubmitting(false);
        }
    };



    return (
        <Box sx={{ 
            pt: { xs: 8, md: 10 },
            pb: { xs: 4, md: 6 }
        }}>
            <Grid container spacing={4} alignItems="flex-start" justifyContent="center">
                <Grid item xs={12} md={8} lg={6}>
                    <StyledCard
                        elevation={8}
                        hover={false}
                        sx={{
                            p: { xs: 3, md: 4 },
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'visible',
                        }}
                    >
                        <Box sx={{ 
                            mb: 4,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Box sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: theme.palette.primary.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: theme.shadows[4],
                                mb: 2
                            }}>
                                <School 
                                    sx={{ 
                                        fontSize: 40, 
                                        color: 'white'
                                    }} 
                                />
                            </Box>
                        </Box>

                        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                            Complete Your Registration
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                            Finish setting up your FCFB account and choose your team preferences
                        </Typography>

                        {validation.errorMessage && (
                            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                                {validation.errorMessage}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
                            <Grid container spacing={3}>
                                {/* Username */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        InputProps={{
                                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />
                                </Grid>

                                {/* Coach Name */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Coach Name"
                                        name="coach_name"
                                        value={formData.coach_name}
                                        onChange={handleChange}
                                        required
                                        InputProps={{
                                            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />
                                </Grid>

                                {/* Position and Discord Tag */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Position</InputLabel>
                                        <Select
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            label="Position"
                                        >
                                            <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                                            <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                                            <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                                            <MenuItem value="SPECIAL_TEAMS_COORDINATOR">Special Teams Coordinator</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Discord Tag"
                                        name="discord_tag"
                                        value={formData.discord_tag}
                                        onChange={handleChange}
                                        required
                                        disabled
                                        InputProps={{
                                            startAdornment: <SportsFootball sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                        helperText="Set from Discord OAuth"
                                    />
                                </Grid>

                                {/* Offensive Playbook */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Offensive Playbook</InputLabel>
                                        <Select
                                            name="offensive_playbook"
                                            value={formData.offensive_playbook}
                                            onChange={handleChange}
                                            label="Offensive Playbook"
                                        >
                                            <MenuItem value="FLEXBONE">Flexbone</MenuItem>
                                            <MenuItem value="SPREAD">Spread</MenuItem>
                                            <MenuItem value="WEST_COAST">West Coast</MenuItem>
                                            <MenuItem value="PRO">Pro</MenuItem>
                                            <MenuItem value="AIR_RAID">Air Raid</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Defensive Playbook */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Defensive Playbook</InputLabel>
                                        <Select
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
                                </Grid>

                                {/* Team Choices */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                        Team Preferences
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                        Choose up to 3 teams in order of preference. You must select at least one team.
                                    </Typography>
                                </Grid>

                                {/* Team Choice 1 */}
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth error={!validation.teamChoicesValid && !formData.team_choice_one}>
                                        <InputLabel sx={{ color: 'text.primary' }}>1st Choice</InputLabel>
                                        <Select
                                            name="team_choice_one"
                                            value={formData.team_choice_one}
                                            onChange={handleChange}
                                            label="1st Choice"
                                            sx={{
                                                '& .MuiSelect-select': {
                                                    color: 'text.primary'
                                                },
                                                '& .MuiMenuItem-root': {
                                                    color: 'text.primary'
                                                }
                                            }}
                                        >
                                            <MenuItem value="" sx={{ color: 'text.primary' }}>No Selection</MenuItem>
                                            {openTeams.length > 0 ? (
                                                openTeams.map((team) => (
                                                    <MenuItem 
                                                        key={team} 
                                                        value={team}
                                                        disabled={
                                                            team === formData.team_choice_two || 
                                                            team === formData.team_choice_three
                                                        }
                                                        sx={{ color: 'text.primary' }}
                                                    >
                                                        {team}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>
                                                    Loading teams...
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Team Choice 2 */}
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>2nd Choice</InputLabel>
                                        <Select
                                            name="team_choice_two"
                                            value={formData.team_choice_two}
                                            onChange={handleChange}
                                            label="2nd Choice"
                                        >
                                            <MenuItem value="">No Selection</MenuItem>
                                            {openTeams.length > 0 ? (
                                                openTeams.map((team) => (
                                                    <MenuItem 
                                                        key={team}
                                                        value={team}
                                                        disabled={
                                                            team === formData.team_choice_two || 
                                                            team === formData.team_choice_three
                                                        }
                                                    >
                                                        {team}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="" disabled>
                                                    Loading teams...
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Team Choice 3 */}
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>3rd Choice</InputLabel>
                                        <Select
                                            name="team_choice_three"
                                            value={formData.team_choice_three}
                                            onChange={handleChange}
                                            label="3rd Choice"
                                        >
                                            <MenuItem value="">No Selection</MenuItem>
                                            {openTeams.length > 0 ? (
                                                openTeams.map((team) => (
                                                    <MenuItem 
                                                        key={team} 
                                                        value={team}
                                                        disabled={
                                                            team === formData.team_choice_one || 
                                                            team === formData.team_choice_two
                                                        }
                                                    >
                                                        {team}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="" disabled>
                                                    Loading teams...
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Email */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        error={!validation.emailValid}
                                        helperText={!validation.emailValid ? "Invalid email address" : ""}
                                        InputProps={{
                                            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />
                                </Grid>

                                {/* Confirm Email */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Email"
                                        name="confirm_email"
                                        type="email"
                                        value={formData.confirm_email}
                                        onChange={handleChange}
                                        required
                                        error={formData.email !== formData.confirm_email && formData.confirm_email !== ""}
                                        helperText={formData.confirm_email !== "" && formData.email !== formData.confirm_email ? "Emails do not match" : ""}
                                        InputProps={{
                                            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />
                                </Grid>

                                {/* Password */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        name="password"
                                        type={formData.show_password ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        error={!validation.passwordValid}
                                        helperText={!validation.passwordValid ? "Must be 8+ chars & include a special character" : ""}
                                        InputProps={{
                                            startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={handleTogglePassword} edge="end">
                                                        {formData.show_password ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                {/* Confirm Password */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        name="confirm_password"
                                        type={formData.show_password ? "text" : "password"}
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required
                                        error={formData.password !== formData.confirm_password && formData.confirm_password !== ""}
                                        helperText={formData.confirm_password !== "" && formData.password !== formData.confirm_password ? "Passwords do not match" : ""}
                                        InputProps={{
                                            startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 4, textAlign: 'center' }}>
                                <StyledButton
                                    type="submit"
                                    fullWidth
                                    size="large"
                                    disabled={isSubmitting}
                                    sx={{ mb: 3 }}
                                >
                                    {isSubmitting ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} sx={{ color: 'white' }} />
                                            <span>Completing Registration...</span>
                                        </Box>
                                    ) : (
                                        'Complete Registration'
                                    )}
                                </StyledButton>
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CompleteRegistrationForm;