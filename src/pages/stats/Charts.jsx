import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
} from '@mui/material';
import { BarChart, ShowChart, TrendingUp } from '@mui/icons-material';
import EloHistoryTab from '../../components/stats/charts/EloHistoryTab';
import RankingsHistoryTab from '../../components/stats/charts/RankingsHistoryTab';
import ScatterPlotsTab from '../../components/stats/charts/ScatterPlotsTab';

/**
 * Charts Page
 * Main page for all statistical charts with tabbed interface
 */
const Charts = () => {
    useEffect(() => { document.title = 'FCFB | Charts'; }, []);

    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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
