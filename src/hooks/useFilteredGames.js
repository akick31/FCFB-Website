import { useState, useEffect, useCallback } from 'react';
import { getFilteredGames } from '../api/gameApi';

const PAGE_SIZE = 50;

const useFilteredGames = (initialSeason, initialWeek, onError) => {
    const [filters, setFilters] = useState({ season: null, week: null, gameType: null, gameStatus: null });
    const [filteredGames, setFilteredGames] = useState([]);
    const [gamesLoading, setGamesLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalGames, setTotalGames] = useState(0);

    const fetchGames = useCallback(async (overrideFilters, page = currentPage) => {
        const f = overrideFilters || filters;
        if (!f.season || !f.week) return;
        setGamesLoading(true);
        try {
            const response = await getFilteredGames({
                filters: [], season: f.season, week: f.week, gameType: f.gameType, gameStatus: f.gameStatus,
                sort: 'MOST_TIME_REMAINING', page, size: PAGE_SIZE,
            });
            const allGames = response.content || [];
            setTotalGames(response.totalElements || allGames.length);
            setFilteredGames(allGames);
        } catch (err) {
            console.error('Failed to load games:', err);
            onError?.('Failed to load games');
        } finally {
            setGamesLoading(false);
        }
    }, [filters, currentPage, onError]);

    useEffect(() => {
        if (!initialSeason || !initialWeek) return;
        const nextFilters = { season: initialSeason, week: initialWeek, gameType: null, gameStatus: null };
        setFilters(nextFilters);
        fetchGames(nextFilters, 0);
    }, [initialSeason, initialWeek]);

    const handleFilterChange = (field, value) => {
        const next = { ...filters, [field]: value === '' || value === 'ALL' ? null : value };
        setFilters(next);
        setCurrentPage(0);
        fetchGames(next, 0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchGames(filters, page);
    };

    return {
        filters,
        filteredGames,
        gamesLoading,
        currentPage,
        totalGames,
        pageSize: PAGE_SIZE,
        pageCount: Math.ceil(totalGames / PAGE_SIZE),
        handleFilterChange,
        handlePageChange,
        refetch: () => fetchGames(filters, currentPage),
    };
};

export default useFilteredGames;
