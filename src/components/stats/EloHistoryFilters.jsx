import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    TextField,
    Grid,
    Button,
    Paper,
    Switch,
    FormControlLabel,
} from '@mui/material';

/**
 * ELO History Filters Component
 * Handles team selection, season filtering, and view mode
 */
const EloHistoryFilters = ({
    selectedTeam,
    setSelectedTeam,
    selectedSeason,
    setSelectedSeason,
    viewMode,
    setViewMode,
    showAllTeams,
    setShowAllTeams,
    onApplyFilters,
    teams = [],
    seasons = [],
    loading = false,
}) => {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={showAllTeams ? 12 : 4}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showAllTeams === true}
                                onChange={(e) => {
                                    if (setShowAllTeams) {
                                        setShowAllTeams(e.target.checked);
                                        if (e.target.checked) {
                                            setSelectedTeam(null);
                                        }
                                    }
                                }}
                                color="primary"
                            />
                        }
                        label="Show All Teams"
                    />
                    {!showAllTeams && (
                        <Box sx={{ mt: 1 }}>
                            <Autocomplete
                                options={teams}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedTeam}
                                onChange={(event, newValue) => setSelectedTeam(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Team"
                                        placeholder="Search for a team..."
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {option.logo && (
                                                <img
                                                    src={option.logo}
                                                    alt={option.name}
                                                    style={{ width: 24, height: 24, borderRadius: '50%' }}
                                                />
                                            )}
                                            <span>{option.name}</span>
                                        </Box>
                                    );
                                }}
                                disabled={loading}
                            />
                        </Box>
                    )}
                </Grid>

                <Grid item xs={12} md={showAllTeams ? 3 : 2}>
                    <FormControl fullWidth>
                        <InputLabel>Season</InputLabel>
                        <Select
                            value={selectedSeason}
                            label="Season"
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            disabled={loading || viewMode === 'all-time'}
                        >
                            <MenuItem value="all-time">All Time</MenuItem>
                            {seasons.map((season) => (
                                <MenuItem key={season} value={season}>
                                    Season {season}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={showAllTeams ? 3 : 2}>
                    <FormControl fullWidth>
                        <InputLabel>View Mode</InputLabel>
                        <Select
                            value={viewMode}
                            label="View Mode"
                            onChange={(e) => {
                                setViewMode(e.target.value);
                                if (e.target.value === 'all-time') {
                                    setSelectedSeason('all-time');
                                }
                            }}
                            disabled={loading}
                        >
                            <MenuItem value="season">By Season</MenuItem>
                            <MenuItem value="all-time">All Time</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={showAllTeams ? 3 : 2}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onApplyFilters}
                        disabled={loading || (!showAllTeams && !selectedTeam)}
                    >
                        Apply
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default EloHistoryFilters;
