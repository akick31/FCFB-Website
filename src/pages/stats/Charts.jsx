import React, { useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import { BarChart, ShowChart, TrendingUp } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import EloHistoryTab from '../../components/stats/charts/EloHistoryTab';
import RankingsHistoryTab from '../../components/stats/charts/RankingsHistoryTab';
import ScatterPlotsTab from '../../components/stats/charts/ScatterPlotsTab';

const TAB_SLUGS = ['elo_history', 'rankings_history', 'stat_plots'];
const TAB_FROM_SLUG = { elo_history: 0, rankings_history: 1, stat_plots: 2 };

/**
 * Charts Page
 * Main page for all statistical charts with tabbed interface
 */
const Charts = () => {
    useEffect(() => { document.title = 'FCFB | Charts'; }, []);

    const { tab } = useParams();
    const navigate = useNavigate();

    const activeTab = TAB_FROM_SLUG[tab] ?? 0;

    useEffect(() => {
        if (!tab) navigate('/charts/elo_history', { replace: true });
    }, [tab, navigate]);

    const handleTabChange = (event, newValue) => {
        navigate(`/charts/${TAB_SLUGS[newValue]}`);
    };

    const tabs = [
        { label: 'ELO History', icon: <ShowChart />, component: <EloHistoryTab /> },
        { label: 'Rankings History', icon: <TrendingUp />, component: <RankingsHistoryTab /> },
        { label: 'Stat Plots', icon: <BarChart />, component: <ScatterPlotsTab /> },
    ];

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                    Charts
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    Interactive charts and visualizations for team statistics, rankings, and performance metrics.
                </Typography>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            label={tab.label}
                            icon={tab.icon}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>
            </Paper>

            <Box sx={{ mt: 3 }}>
                {tabs[activeTab].component}
            </Box>
        </Container>
    );
};

export default Charts;
