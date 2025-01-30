import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Menu, IconButton, Typography } from '@mui/material';
import { getFilteredScorebugs } from '../../api/scorebugApi';
import ScorebugGrid from './scorebugs/ScorebugGrid';
import MenuIcon from "@mui/icons-material/Menu";
import FilterMenu from '../menu/FilterMenu';

const PastGames = ({menuOpen, menuAnchor, onMenuToggle}) => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        filters: null,
        category: 'PAST',
        sort: 'CLOSEST_TO_END',
        conference: null,
        season: null,
        week: null,
        page: 0,
        size: 20,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getFilteredScorebugs(
                    filters.filters,
                    filters.category,
                    filters.sort,
                    filters.conference,
                    filters.season,
                    filters.week,
                    filters.page,
                    filters.size
                );
                setGames(response.content);
            } catch (err) {
                setError(`Failed to fetch scorebugs: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    return (
        <>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-start', pl: 14}}>
                <IconButton onClick={onMenuToggle}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" sx={{ml: 1}}>
                    Filters
                </Typography>
            </Box>

            <Box sx={{py: 2, display: 'flex', justifyContent: 'center'}}>
                {loading ? (
                    <CircularProgress/>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        <Menu
                            anchorEl={menuAnchor}
                            open={menuOpen}
                            onClose={onMenuToggle}
                        >
                            <FilterMenu
                                filters={filters}
                                onChange={setFilters}
                                onApply={(updatedFilters) => {
                                    setFilters(updatedFilters);
                                    onMenuToggle();
                                }}
                                category="past"
                            />
                        </Menu>

                        {games.length === 0 ? (
                            <Alert severity="info">No games found for the selected filters</Alert>
                        ) : (
                            <ScorebugGrid games={games}/>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

export default PastGames;