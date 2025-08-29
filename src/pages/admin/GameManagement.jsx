import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    TextField, 
    Grid, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Card,
    CardContent
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNavigationItems } from '../../config/adminNavigation';
import { useNavigate } from 'react-router-dom';

const GameManagement = () => {
    const [gameData, setGameData] = useState({
        homeTeam: '',
        awayTeam: '',
        gameType: '',
        season: '',
        week: ''
    });

    const navigate = useNavigate();

    const navigationItems = adminNavigationItems;

    const handleNavigationChange = (item) => {
        console.log('Navigate to:', item.path);
        navigate(item.path);
    };

    const handleInputChange = (field, value) => {
        setGameData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateGame = () => {
        console.log('Creating game:', gameData);
        // Implement game creation logic here
    };

    return (
        <DashboardLayout
            title="Game Management"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Game Management
                </Typography>
                
                <Grid container spacing={4}>
                    {/* Create New Game */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                    Create New Game
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Home Team"
                                            value={gameData.homeTeam}
                                            onChange={(e) => handleInputChange('homeTeam', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'white',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Away Team"
                                            value={gameData.awayTeam}
                                            onChange={(e) => handleInputChange('awayTeam', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'white',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Game Type
                                            </InputLabel>
                                            <Select
                                                value={gameData.gameType}
                                                onChange={(e) => handleInputChange('gameType', e.target.value)}
                                                sx={{ 
                                                    color: 'white',
                                                    '& .MuiOutlinedInput-notchedOutline': { 
                                                        borderColor: 'rgba(255, 255, 255, 0.3)' 
                                                    }
                                                }}
                                            >
                                                <MenuItem value="REGULAR_SEASON">Regular Season</MenuItem>
                                                <MenuItem value="BOWL_GAME">Bowl Game</MenuItem>
                                                <MenuItem value="PLAYOFF">Playoff</MenuItem>
                                                <MenuItem value="CHAMPIONSHIP">Championship</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Season"
                                            type="number"
                                            value={gameData.season}
                                            onChange={(e) => handleInputChange('season', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'white',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Week"
                                            type="number"
                                            value={gameData.week}
                                            onChange={(e) => handleInputChange('week', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'white',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            onClick={handleCreateGame}
                                            sx={{ 
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'primary.dark' }
                                            }}
                                        >
                                            Create Game
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Game Management Actions */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                    Quick Actions
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            sx={{ 
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                                color: 'white',
                                                '&:hover': { borderColor: 'white' }
                                            }}
                                        >
                                            Start All Games
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            sx={{ 
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                                color: 'white',
                                                '&:hover': { borderColor: 'white' }
                                            }}
                                        >
                                            Pause All Games
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            sx={{ 
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                                color: 'white',
                                                '&:hover': { borderColor: 'white' }
                                            }}
                                        >
                                            End All Games
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            sx={{ 
                                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                                color: 'white',
                                                '&:hover': { borderColor: 'white' }
                                            }}
                                        >
                                            View Game Logs
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
};

export default GameManagement;
