import React, { useState } from "react";
import { conferences } from "../constants/conferences";
import { offensivePlaybooks } from "../constants/offensivePlaybooks";
import { defensivePlaybooks } from "../constants/defensivePlaybooks";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { ChromePicker } from 'react-color';
import { createTeam } from '../../api/teamApi';
import StyledButton from '../ui/StyledButton';
import PropTypes from 'prop-types';

const CreateTeamForm = ({ open, onClose, onTeamCreated }) => {
    const [validation, setValidation] = useState({ errorMessage: null });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
        abbreviation: '',
        logo: '',
        scorebug_logo: '',
        primary_color: '#1976d2',
        secondary_color: '#ffffff',
        subdivision: 'FAKE', // Fixed to FAKE subdivision
        offensive_playbook: '',
        defensive_playbook: '',
        conference: '',
        coach_usernames: [],
        coach_names: [],
        coach_discord_tags: [],
        coach_discord_ids: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleColorChange = (color, colorType) => {
        setFormData((prev) => ({
            ...prev,
            [colorType]: color.hex,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setValidation({ errorMessage: null });

        if (!formData.name || !formData.abbreviation) {
            setValidation({ errorMessage: "Team name and abbreviation are required." });
            setLoading(false);
            return;
        }

        if (!formData.offensive_playbook || !formData.defensive_playbook) {
            setValidation({ errorMessage: "Both offensive and defensive playbooks are required." });
            setLoading(false);
            return;
        }

        if (!formData.conference) {
            setValidation({ errorMessage: "Conference is required." });
            setLoading(false);
            return;
        }

        try {
            const newTeam = await createTeam(formData);
            console.log('Team created successfully:', newTeam);
            
            // Reset form
            setFormData({
                name: '',
                short_name: '',
                abbreviation: '',
                logo: '',
                scorebug_logo: '',
                primary_color: '#1976d2',
                secondary_color: '#ffffff',
                subdivision: 'FAKE',
                offensive_playbook: '',
                defensive_playbook: '',
                conference: '',
                coach_usernames: [],
                coach_names: [],
                coach_discord_tags: [],
                coach_discord_ids: [],
            });
            
            onTeamCreated?.(newTeam);
            onClose();
        } catch (error) {
            setValidation({ errorMessage: error.message || "Failed to create team. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setValidation({ errorMessage: null });
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md"
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
                    Create New Team
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>
            
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Create a new FAKE subdivision team. All fields marked with * are required.
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Team Name *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Short Name"
                            name="short_name"
                            value={formData.short_name}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="Team Abbreviation *"
                            name="abbreviation"
                            value={formData.abbreviation}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ maxLength: 4 }}
                        />

                        <TextField
                            label="Logo URL"
                            name="logo"
                            value={formData.logo}
                            onChange={handleChange}
                            fullWidth
                        />

                        <TextField
                            label="Scorebug Logo URL"
                            name="scorebug_logo"
                            value={formData.scorebug_logo}
                            onChange={handleChange}
                            fullWidth
                        />

                        {/* Color Pickers */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body1">Primary Color</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ChromePicker
                                    color={formData.primary_color}
                                    onChangeComplete={(color) => handleColorChange(color, "primary_color")}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body1">Secondary Color</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ChromePicker
                                    color={formData.secondary_color}
                                    onChangeComplete={(color) => handleColorChange(color, "secondary_color")}
                                />
                            </Box>
                        </Box>

                        {/* Subdivision - Fixed to FAKE */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="subdivision-label">Subdivision</InputLabel>
                            <Select
                                labelId="subdivision-label"
                                name="subdivision"
                                value={formData.subdivision}
                                onChange={handleChange}
                                label="Subdivision"
                                disabled
                            >
                                <MenuItem value="FAKE">FAKE</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Offensive Playbook */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="offensive-playbook-label">Offensive Playbook *</InputLabel>
                            <Select
                                labelId="offensive-playbook-label"
                                name="offensive_playbook"
                                value={formData.offensive_playbook}
                                onChange={handleChange}
                                label="Offensive Playbook *"
                                required
                            >
                                {offensivePlaybooks.map((playbook) => (
                                    <MenuItem key={playbook.value} value={playbook.value}>
                                        {playbook.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Defensive Playbook */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="defensive-playbook-label">Defensive Playbook *</InputLabel>
                            <Select
                                labelId="defensive-playbook-label"
                                name="defensive_playbook"
                                value={formData.defensive_playbook}
                                onChange={handleChange}
                                label="Defensive Playbook *"
                                required
                            >
                                {defensivePlaybooks.map((playbook) => (
                                    <MenuItem key={playbook.value} value={playbook.value}>
                                        {playbook.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Conference */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="conference-label">Conference *</InputLabel>
                            <Select
                                labelId="conference-label"
                                name="conference"
                                value={formData.conference}
                                onChange={handleChange}
                                label="Conference *"
                                required
                            >
                                {conferences.map((conference) => (
                                    <MenuItem key={conference.value} value={conference.value}>
                                        {conference.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {validation.errorMessage && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {validation.errorMessage}
                            </Alert>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <StyledButton
                    variant="outlined"
                    onClick={handleClose}
                    sx={{ mr: 1 }}
                >
                    Cancel
                </StyledButton>
                <StyledButton
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Team'}
                </StyledButton>
            </DialogActions>
        </Dialog>
    );
};

CreateTeamForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onTeamCreated: PropTypes.func,
};

export default CreateTeamForm;
