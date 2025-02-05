import React, { useState } from 'react';
import {Box, Typography, useTheme, useMediaQuery, Card} from '@mui/material';
import { gameTabConfigs } from '../components/constants/tabConfigs';
import OngoingGames from '../components/game/scoreboard/OngoingGames';
import PastGames from '../components/game/scoreboard/PastGames';
import Scrimmages from '../components/game/scoreboard/Scrimmages';
import PastScrimmages from '../components/game/scoreboard/PastScrimmages';
import { Header, StyledTab, StyledTabs } from '../styles/GamesStyles';

const Scoreboard = () => {
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
        <Box sx={theme.root}>
            <Card sx={theme.standardCard}>
                <Header>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Nationwide Scoreboard
                    </Typography>
                </Header>
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
                {renderGameTypeComponent()}
            </Card>
        </Box>
    );
};

export default Scoreboard;