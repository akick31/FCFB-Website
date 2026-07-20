import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getFilteredGames } from '../../../api/gameApi';
import ScoreboardList from './ScoreboardList';
import OffseasonNotice from './OffseasonNotice';
import { useOffseasonStatus } from './hooks/useOffseasonStatus';

const POLL_INTERVAL_MS = 15000;

const OngoingGames = () => {
    const { isOffseason, loading: offseasonLoading } = useOffseasonStatus();
    const [games, setGames] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        filters: [],
        category: 'ongoing',
        sort: 'CLOSEST_TO_END',
        conference: null,
        season: null,
        week: null,
        gameType: null,
        gameStatus: null,
        gameMode: null,
        rankedGame: null,
        page: 0,
        size: 10,
    });
    const isFirstLoad = useRef(true);
    const pollTimerRef = useRef(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await getFilteredGames({
                filters: filters.filters,
                week: filters.week,
                season: filters.season,
                conference: filters.conference,
                gameType: filters.gameType,
                gameStatus: filters.gameStatus,
                gameMode: filters.gameMode,
                rankedGame: filters.rankedGame,
                category: 'ONGOING',
                sort: filters.sort,
                page: filters.page,
                size: filters.size,
            });

            setGames(response.content);
            setTotalPages(response["total_pages"]);
            setTotalGames(response["total_elements"]);
            setError(null);
        } catch (err) {
            setError(`Failed to fetch games: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (offseasonLoading || isOffseason) return;
        const showLoading = isFirstLoad.current;
        isFirstLoad.current = false;
        fetchData(showLoading);
    }, [fetchData, offseasonLoading, isOffseason]);

    useEffect(() => {
        if (offseasonLoading || isOffseason) return;
        pollTimerRef.current = setInterval(() => {
            fetchData(false);
        }, POLL_INTERVAL_MS);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        };
    }, [fetchData, offseasonLoading, isOffseason]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    if (offseasonLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isOffseason) {
        return <OffseasonNotice />;
    }

    return (
        <ScoreboardList
            games={games}
            onPageChange={handlePageChange}
            totalGames={totalGames}
            currentPage={filters.page}
            totalPages={totalPages}
            loading={loading}
            error={error}
            title="Live Games"
            filters={filters}
            setFilters={setFilters}
        />
    );
};

export default OngoingGames;