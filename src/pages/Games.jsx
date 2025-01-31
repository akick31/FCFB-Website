import React, { useState } from 'react';
import {Box, Paper, Typography, useTheme, useMediaQuery} from '@mui/material';
import { gameTabConfigs } from '../constants/tabConfigs';
import OngoingGames from '../components/game/OngoingGames';
import PastGames from '../components/game/PastGames';
import Scrimmages from '../components/game/Scrimmages';
import PastScrimmages from '../components/game/PastScrimmages';
import { Header, StyledContainer, StyledTab, StyledTabs } from '../styles/GamesStyles';

const Games = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [gameType, setGameType] = useState('ongoing');
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);

    const handleTabChange = (event, newValue) => {
        setGameType(newValue);
        setMenuOpen(false);
    };

    const handleMenuToggle = (event) => {
        setMenuOpen(!menuOpen);
        setMenuAnchor(event ? event.currentTarget : null);
    };

    const renderGameTypeComponent = () => {
        switch (gameType) {
            case 'ongoing':
                return <OngoingGames menuOpen={menuOpen} menuAnchor={menuAnchor} onMenuToggle={handleMenuToggle} />;
            case 'past':
                return <PastGames menuOpen={menuOpen} menuAnchor={menuAnchor} onMenuToggle={handleMenuToggle} />;
            case 'scrimmages':
                return <Scrimmages menuOpen={menuOpen} menuAnchor={menuAnchor} onMenuToggle={handleMenuToggle} />;
            case 'past-scrimmages':
                return <PastScrimmages menuOpen={menuOpen} menuAnchor={menuAnchor} onMenuToggle={handleMenuToggle} />;
            default:
                return <OngoingGames menuOpen={menuOpen} menuAnchor={menuAnchor} onMenuToggle={handleMenuToggle} />;
        }
    };

    return (
        <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 0 }}>
            <StyledContainer maxWidth="lg">
                <Header>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Nationwide Scoreboard
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

                {renderGameTypeComponent()}
            </StyledContainer>
        </Box>
    );
};

export default Games;