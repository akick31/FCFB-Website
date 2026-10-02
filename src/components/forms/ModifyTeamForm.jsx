import React, { useState } from "react";
import { useConferencesMap, allConferenceList } from "../constants/conferences";
import { offensivePlaybooks } from "../constants/offensivePlaybooks";
import { defensivePlaybooks } from "../constants/defensivePlaybooks";
import {
    Box,
    Button,
    Card,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Alert,
    useTheme,
} from "@mui/material";
import { updateTeam } from '../../api/teamApi';
import {Header} from "../../styles/GamesStyles";

const ModifyTeamForm = ({ team }) => {
    useConferencesMap();
    const conferences = allConferenceList();
    const theme = useTheme();
    const [validation, setValidation] = useState({ errorMessage: null });
    const [formData, setFormData] = useState({
        ...team,
        primary_color: team.primary_color,
        secondary_color: team.secondary_color,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.abbreviation) {
            setValidation({ errorMessage: "Team name and abbreviation are required." });
            return;
        }

        const updatedTeamData = {
            ...team,
            ...formData,
        };

        try {
            await updateTeam(updatedTeamData);
            alert("Team updated successfully!");
        } catch (error) {
            setValidation({ errorMessage: "Failed to modify team. Please try again." });
        }
    };

    return (
        <Box sx={theme.root}>
            <Card sx={theme.standardCard}>
                <Header>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Modify Team
                    </Typography>
                </Header>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Team Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Team Abbreviation"
                            name="abbreviation"
                            value={formData.abbreviation}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="offensive-playbook-label">Offensive Playbook</InputLabel>
                            <Select
                                labelId="offensive-playbook-label"
                                name="offensive_playbook"
                                value={formData.offensive_playbook}
                                onChange={handleChange}
                                label="Offensive Playbook"
                            >
                                {offensivePlaybooks.map((playbook) => (
                                    <MenuItem key={playbook.value} value={playbook.value}>
                                        {playbook.label}
                                    </MenuItem>
                                ))}
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
                                {defensivePlaybooks.map((playbook) => (
                                    <MenuItem key={playbook.value} value={playbook.value}>
                                        {playbook.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="conference-label">Conference</InputLabel>
                            <Select
                                labelId="conference-label"
                                name="conference"
                                value={formData.conference || ""}
                                onChange={handleChange}
                                label="Conference"
                            >
                                {conferences.map((conference) => (
                                    <MenuItem key={conference.code} value={conference.code}>
                                        {conference.label}{!conference.active ? ' (inactive)' : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

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
                            Modify Team
                        </Button>
                    </Box>
                </form>
            </Card>
        </Box>
    );
};

export default ModifyTeamForm;