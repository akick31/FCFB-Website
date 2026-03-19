import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilteredGames } from '../../../api/gameApi';
import { getCurrentSeason, getCurrentWeek } from '../../../api/seasonApi';
import ScoreboardList from './ScoreboardList';
import { Box } from '@mui/material';
import SeasonDropdown from '../../dropdown/SeasonDropdown';
import WeekDropdown from '../../dropdown/WeekDropdown';

const PastGames = ({ urlSeason, urlWeek }) => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const initializedRef = useRef(false);
    const [filters, setFilters] = useState({
        filters: [],
        category: 'past',
        sort: 'MOST_TIME_REMAINING',
        conference: null,
        season: urlSeason ? parseInt(urlSeason) : null,
        week: urlWeek ? parseInt(urlWeek) : null,
        gameType: null,
        gameStatus: null,
        rankedGame: null,
        page: 0,
        size: 10,
    });

    // Set default season and week when no URL params provided
    useEffect(() => {
        if (urlSeason && urlWeek) {
            // URL params provided, already set in initial state
            initializedRef.current = true;
            return;
        }
        if (initializedRef.current) return;
        initializedRef.current = true;
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
                navigate(`/scoreboard/past/${currentSeason}/${currentWeek}`, { replace: true });
            } catch (error) {
                console.error('Failed to fetch current season/week:', error);
                setFilters(prev => ({
                    ...prev,
                    season: 11,
                    week: 1
                }));
            }
        };
        setDefaults();
    // eslint-disable-next-line
    }, []);

    // Sync from URL params when they change (e.g., back/forward navigation)
    useEffect(() => {
        if (!urlSeason || !urlWeek) return;
        setFilters(prev => {
            if (prev.season === parseInt(urlSeason) && prev.week === parseInt(urlWeek)) return prev;
            return { ...prev, season: parseInt(urlSeason), week: parseInt(urlWeek), page: 0 };
        });
    }, [urlSeason, urlWeek]);

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

        if (filters.season !== null && filters.week !== null) {
            fetchData();
        }
    }, [filters]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleSeasonChange = (event) => {
        const newValue = event.target.value === "" ? null : event.target.value;
        setFilters(prev => ({ ...prev, season: newValue, page: 0 }));
        if (newValue && filters.week) {
            navigate(`/scoreboard/past/${newValue}/${filters.week}`, { replace: true });
        }
    };

    const handleWeekChange = (event) => {
        const newValue = event.target.value === "" ? null : event.target.value;
        setFilters(prev => ({ ...prev, week: newValue, page: 0 }));
        if (filters.season && newValue) {
            navigate(`/scoreboard/past/${filters.season}/${newValue}`, { replace: true });
        }
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
