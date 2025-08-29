import React, { useState, useEffect } from 'react';
import { getFilteredGames } from '../../../api/gameApi';
import { getCurrentSeason, getCurrentWeek } from '../../../api/seasonApi';
import ScoreboardList from './ScoreboardList';
import { Box } from '@mui/material';
import SeasonDropdown from '../../dropdown/SeasonDropdown';
import WeekDropdown from '../../dropdown/WeekDropdown';

const PastGames = () => {
    const [games, setGames] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        filters: [],
        category: 'past',
        sort: 'MOST_TIME_REMAINING',
        conference: null,
        season: null,
        week: null,
        gameType: null,
        gameStatus: null,
        rankedGame: null,
        page: 0,
        size: 10,
    });

    // Set default season and week when component loads
    useEffect(() => {
        const setDefaults = async () => {
            try {
                const [currentSeason, currentWeek] = await Promise.all([
                    getCurrentSeason(),
                    getCurrentWeek()
                ]);
                
                setFilters(prev => ({
                    ...prev,
                    season: currentSeason,
                    week: currentWeek
                }));
            } catch (error) {
                console.error('Failed to fetch current season/week:', error);
                // Set fallback values if API fails
                setFilters(prev => ({
                    ...prev,
                    season: 11, // Fallback to season 11
                    week: 1     // Fallback to week 1
                }));
            }
        };
        
        setDefaults();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getFilteredGames({
                    filters: filters.filters,
                    week: filters.week,
                    season: filters.season,
                    conference: filters.conference,
                    gameType: filters.gameType,
                    gameStatus: filters.gameStatus,
                    rankedGame: filters.rankedGame,
                    category: 'PAST',
                    sort: filters.sort,
                    page: filters.page,
                    size: filters.size,
                });
                setGames(response.content);
                setTotalPages(response["total_pages"]);
                setTotalGames(response["total_elements"]);
            } catch (err) {
                setError(`Failed to fetch games: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        // Fetch data when filters change, but only if we have season and week
        if (filters.season !== null && filters.week !== null) {
            fetchData();
        }
    }, [filters]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleSeasonChange = (event) => {
        const newValue = event.target.value === "" ? null : event.target.value;
        setFilters(prev => ({
            ...prev,
            season: newValue,
            page: 0 // Reset to first page when filters change
        }));
    };

    const handleWeekChange = (event) => {
        const newValue = event.target.value === "" ? null : event.target.value;
        setFilters(prev => ({
            ...prev,
            week: newValue,
            page: 0 // Reset to first page when filters change
        }));
    };

    return (
        <Box>
            <ScoreboardList
                games={games}
                onPageChange={handlePageChange}
                totalGames={totalGames}
                currentPage={filters.page}
                totalPages={totalPages}
                loading={loading}
                error={error}
                title="Past Games"
                filters={filters}
                setFilters={setFilters}
                // Pass season/week filters to be displayed in the header
                seasonFilter={
                    <SeasonDropdown
                        value={filters.season}
                        onChange={handleSeasonChange}
                    />
                }
                weekFilter={
                    <WeekDropdown
                        value={filters.week}
                        onChange={handleWeekChange}
                    />
                }
            />
        </Box>
    );
};

export default PastGames;