import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    Paper,
    Grid,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';

/**
 * Rankings History Filters Component
 * Provides filtering options for rankings history chart
 */
const RankingsHistoryFilters = ({
    selectedTeam,
    setSelectedTeam,
    selectedSeason,
    setSelectedSeason,
    viewMode,
    setViewMode,
    showAllTeams,
    setShowAllTeams,
    onApplyFilters,
    teams,
    seasons,
    loading,
}) => {
    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterList />
                <Box component="h3" sx={{ m: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    Filters
                </Box>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showAllTeams}
                                    onChange={(e) => {
                                        setShowAllTeams(e.target.checked);
                                        if (!e.target.checked && teams && teams.length > 0) {
                                            // When switching to single team, default to first team alphabetically
                                            const sortedTeams = [...teams].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                                            setSelectedTeam(sortedTeams[0]);
                                        } else {
                                            setSelectedTeam(null);
                                        }
                                    }}
                                    disabled={loading}
                                />
                            }
                            label="Show All Teams"
                        />
                    </FormControl>
                </Grid>
                
                {!showAllTeams && (
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Team</InputLabel>
                            <Select
                                value={selectedTeam?.name || ''}
                                label="Team"
                                onChange={(e) => {
                                    const team = teams.find(t => t.name === e.target.value);
                                    setSelectedTeam(team || null);
                                }}
                                disabled={loading}
                            >
                                {teams.map((team) => (
                                    <MenuItem key={team.name} value={team.name}>
                                        {team.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                )}
                
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>View Mode</InputLabel>
                        <Select
                            value={viewMode}
                            label="View Mode"
                            onChange={(e) => setViewMode(e.target.value)}
                            disabled={loading}
                        >
                            <MenuItem value="all-time">All Time</MenuItem>
                            <MenuItem value="season">By Season</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                {viewMode === 'season' && (
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Season</InputLabel>
                            <Select
                                value={selectedSeason}
                                label="Season"
                                onChange={(e) => setSelectedSeason(e.target.value)}
                                disabled={loading}
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
                )}
                
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="contained"
                        onClick={onApplyFilters}
                        disabled={loading}
                        fullWidth
                    >
                        Apply Filters
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default RankingsHistoryFilters;
