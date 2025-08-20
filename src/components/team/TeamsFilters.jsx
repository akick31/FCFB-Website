import React from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    TextField, 
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { 
    Search,
    FilterList
} from '@mui/icons-material';
import { formatConferenceName, getUniqueConferences } from '../../utils/conferenceUtils';
import { getAvailableTeamsCount } from '../../utils/teamDataUtils';
import { TEAM_STATUS, TEAM_STATUS_LABELS, FILTER_LABELS } from '../../constants/teamConstants';

/**
 * Teams filters component
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.setSearchTerm - Function to update search term
 * @param {string} props.selectedConference - Currently selected conference
 * @param {Function} props.setSelectedConference - Function to update selected conference
 * @param {string} props.selectedAvailability - Currently selected availability
 * @param {Function} props.setSelectedAvailability - Function to update selected availability
 * @param {Array} props.teams - Array of all teams
 * @param {Array} props.filteredTeams - Array of filtered teams
 * @param {Object} props.theme - Material-UI theme object
 * @returns {JSX.Element} - Teams filters component
 */
const TeamsFilters = ({
    searchTerm,
    setSearchTerm,
    selectedConference,
    setSelectedConference,
    selectedAvailability,
    setSelectedAvailability,
    teams,
    filteredTeams,
    theme
}) => {
    const conferences = getUniqueConferences(teams);
    const availableTeamsCount = getAvailableTeamsCount(teams);

    return (
        <Box sx={{ 
            mb: 4, 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1]
        }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList />
                Filters & Search
            </Typography>
            
            <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
                {/* Search */}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        placeholder="Search teams, conferences, or abbreviations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>

                {/* Conference Filter */}
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>{FILTER_LABELS.CONFERENCE}</InputLabel>
                        <Select
                            value={selectedConference}
                            label={FILTER_LABELS.CONFERENCE}
                            onChange={(e) => setSelectedConference(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">{FILTER_LABELS.ALL_CONFERENCES}</MenuItem>
                            {conferences.map((conf) => (
                                <MenuItem key={conf} value={conf}>
                                    {formatConferenceName(conf)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Availability Filter */}
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>{FILTER_LABELS.AVAILABILITY}</InputLabel>
                        <Select
                            value={selectedAvailability}
                            label={FILTER_LABELS.AVAILABILITY}
                            onChange={(e) => setSelectedAvailability(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="">{FILTER_LABELS.ALL_TEAMS}</MenuItem>
                            <MenuItem value={TEAM_STATUS.AVAILABLE}>{TEAM_STATUS_LABELS[TEAM_STATUS.AVAILABLE]}</MenuItem>
                            <MenuItem value={TEAM_STATUS.TAKEN}>{TEAM_STATUS_LABELS[TEAM_STATUS.TAKEN]}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Results Count */}
                <Grid item xs={12} sm={12} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                            {filteredTeams.length}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Teams Found
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.success.main, mt: 1 }}>
                            {availableTeamsCount}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Available Teams
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeamsFilters; 