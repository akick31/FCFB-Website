import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilteredGames } from '../../../api/gameApi';
import { getCurrentSeason, getCurrentWeek } from '../../../api/seasonApi';
import ScoreboardList from './ScoreboardList';
import { Box } from '@mui/material';
import SeasonDropdown from '../../dropdown/SeasonDropdown';
import WeekDropdown from '../../dropdown/WeekDropdown';

const POSTSEASON_WEEKS = [14, 15, 16, 17, 18];

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
        postseason: false,   // true = minWeek 14, no gameType restriction
        playoffsOnly: false, // true = PLAYOFFS + NATIONAL_CHAMPIONSHIP game types only
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
                if (filters.postseason || filters.playoffsOnly) {
                    // Fetch each postseason week in parallel and combine results.
                    // For Playoffs: week 14 filters by PLAYOFFS game type; weeks 15+ are all playoffs.
                    const results = await Promise.all(
                        POSTSEASON_WEEKS.map(week =>
                            getFilteredGames({
                                filters: filters.filters,
                                week,
                                season: filters.season,
                                gameType: filters.playoffsOnly ? 'PLAYOFFS' : null,
                                category: 'PAST',
                                sort: filters.sort,
                                page: 0,
                                size: 100,
                            }).catch(() => ({ content: [] }))
                        )
                    );
                    const allGames = results.flatMap(r => r.content || []);
                    setGames(allGames);
                    setTotalGames(allGames.length);
                    setTotalPages(1);
                } else {
                    const response = await getFilteredGames({
                        filters: filters.filters,
                        week: filters.week,
                        season: filters.season,
                        conference: filters.conference,
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
                }
            } catch (err) {
                setError(`Failed to fetch games: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (filters.season !== null && (filters.week !== null || filters.postseason || filters.playoffsOnly)) {
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
        const newValue = event.target.value;
        if (newValue === 'POSTSEASON') {
            setFilters(prev => ({ ...prev, postseason: true, playoffsOnly: false, week: null, gameType: null, page: 0 }));
        } else if (newValue === 'PLAYOFFS') {
            setFilters(prev => ({ ...prev, playoffsOnly: true, postseason: false, week: null, gameType: null, page: 0 }));
        } else {
            const parsed = newValue === '' ? null : newValue;
            setFilters(prev => ({ ...prev, week: parsed, postseason: false, playoffsOnly: false, gameType: null, page: 0 }));
            if (filters.season && parsed) {
                navigate(`/scoreboard/past/${filters.season}/${parsed}`, { replace: true });
            }
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
                        value={filters.postseason ? 'POSTSEASON' : filters.playoffsOnly ? 'PLAYOFFS' : filters.week}
                        onChange={handleWeekChange}
                    />
                }
            />
        </Box>
    );
};

export default PastGames;
