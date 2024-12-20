import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
    Paper
} from '@mui/material';
import { gameTabConfigs } from '../constants/tabConfigs';
import { getScorebugByGameId } from '../api/scorebugApi';
import ScorebugGrid from '../components/ScorebugGrid';
import {Header, LoadingContainer, StyledContainer, StyledTab, StyledTabs} from '../styles/GamesStyles';


const Games = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [state, setState] = useState({
        games: [],
        scorebugs: {},
        loading: true,
        error: null,
        gameType: 'ongoing'
    });

    const { games, scorebugs, loading, error, gameType } = state;

    const fetchGames = useCallback(async (type) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const fetchFn = gameTabConfigs.find(config => config.value === type).fetch;
            const response = await fetchFn();
            setState(prev => ({
                ...prev,
                games: response.data,
                loading: false
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: `Failed to load ${type.replace('-', ' ')} games. ${err.message}`,
                loading: false
            }));
        }
    }, []);

    const fetchScorebugs = useCallback(async (gamesData, currentScorebugs) => {
        const newScorebugs = {};
        const promises = gamesData
            .filter(game => !currentScorebugs[game.game_id])
            .map(async game => {
                try {
                    const scorebug = await getScorebugByGameId(game.game_id);
                    newScorebugs[game.game_id] = scorebug;
                } catch (err) {
                    console.error(`Failed to fetch scorebug for game ${game.game_id}:`, err);
                }
            });

        await Promise.all(promises);

        if (Object.keys(newScorebugs).length > 0) {
            setState(prev => ({
                ...prev,
                scorebugs: { ...prev.scorebugs, ...newScorebugs }
            }));
        }
    }, []);

    useEffect(() => {
        fetchGames(gameType);
    }, [gameType, fetchGames]);

    useEffect(() => {
        if (games.length > 0) {
            fetchScorebugs(games, scorebugs);
        }
    }, [games, scorebugs, fetchScorebugs]);

    const handleTabChange = (event, newValue) => {
        setState(prev => ({ ...prev, gameType: newValue }));
    };

    return (
        <Box sx={{
            bgcolor: 'white',
            minHeight: '100vh',
            py: 3
        }}>
            <StyledContainer maxWidth="lg">
                <Header>
                    <Typography
                        variant={isMobile ? "h4" : "h3"}
                        component="h1"
                        gutterBottom
                        sx={{ fontWeight: 'bold' }}
                    >
                        Nationwide Scoreboard
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Follow live updates from games across the country
                    </Typography>
                </Header>

                <Paper elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
                    <StyledTabs
                        value={gameType}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                        variant={isMobile ? "scrollable" : "standard"}
                        scrollButtons={isMobile ? "auto" : false}
                    >
                        {gameTabConfigs.map(({ label, value }) => (
                            <StyledTab
                                key={value}
                                label={label}
                                value={value}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: '1rem'
                                }}
                            />
                        ))}
                    </StyledTabs>
                </Paper>

                {loading ? (
                    <LoadingContainer>
                        <CircularProgress size={40} />
                    </LoadingContainer>
                ) : error ? (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                ) : games.length === 0 ? (
                    <Alert
                        severity="info"
                        sx={{ mb: 2 }}
                    >
                        No {gameType.replace('-', ' ')} games available at this time
                    </Alert>
                ) : (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <ScorebugGrid
                            games={games}
                            scorebugs={scorebugs}
                        />
                    </Box>
                )}
            </StyledContainer>
        </Box>
    );
};

export default Games;