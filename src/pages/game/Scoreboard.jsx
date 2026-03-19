import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Tabs,
    Tab,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    SportsFootball,
    Schedule,
    History
} from '@mui/icons-material';
import PageLayout from '../../components/layout/PageLayout';
import StyledCard from '../../components/ui/StyledCard';
import OngoingGames from '../../components/game/scoreboard/OngoingGames';
import PastGames from '../../components/game/scoreboard/PastGames';
import Scrimmages from '../../components/game/scoreboard/Scrimmages';

const TAB_SLUGS = ['live', 'past', 'scrimmages'];
const TAB_FROM_SLUG = { live: 0, past: 1, scrimmages: 2 };

const Scoreboard = () => {
    const { tab, season: urlSeason, week: urlWeek } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const activeTab = TAB_FROM_SLUG[tab] ?? 0;

    useEffect(() => { document.title = 'FCFB | Scoreboard'; }, []);

    // Redirect bare /scoreboard to /scoreboard/live
    useEffect(() => {
        if (!tab) navigate('/scoreboard/live', { replace: true });
    }, [tab, navigate]);

    const tabs = [
        { label: 'Live Games', icon: <SportsFootball />, component: <OngoingGames /> },
        { label: 'Past Games', icon: <History />, component: <PastGames urlSeason={urlSeason} urlWeek={urlWeek} /> },
        { label: 'Scrimmages', icon: <Schedule />, component: <Scrimmages /> }
    ];

    const handleTabChange = (event, newValue) => {
        navigate(`/scoreboard/${TAB_SLUGS[newValue]}`);
    };

    return (
        <PageLayout
            title="Scoreboard"
            subtitle="Follow all the action in real-time across the FCFB league"
            fullWidth
        >
            <StyledCard sx={{ 
                p: 0, 
                overflow: 'hidden'
            }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant={isMobile ? 'scrollable' : 'fullWidth'}
                        scrollButtons={isMobile ? 'auto' : false}
                        sx={{
                            px: { xs: 1, sm: 2 },
                            '& .MuiTab-root': {
                                minHeight: { xs: 48, sm: 64 },
                                fontSize: { xs: '0.85rem', sm: '1rem' },
                                fontWeight: 600,
                                textTransform: 'none',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '2px',
                            },
                        }}
                    >
                        {tabs.map((tabDef, index) => (
                            <Tab
                                key={index}
                                label={tabDef.label}
                                icon={tabDef.icon}
                                iconPosition="start"
                                sx={{
                                    '& .MuiTab-iconWrapper': {
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' }
                                    }
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {tabs[activeTab].component}
                </Box>
            </StyledCard>
        </PageLayout>
    );
};

export default Scoreboard;