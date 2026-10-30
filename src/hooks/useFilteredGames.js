import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { getFilteredGames } from '../api/gameApi';

const DEFAULT_PAGE_SIZE = 15;

const useFilteredGames = (initialSeason, initialWeek, onError, pageSize = DEFAULT_PAGE_SIZE) => {
    const pageSizeRef = useRef(pageSize);
    pageSizeRef.current = pageSize;
    const [filters, setFilters] = useState({ season: null, week: null, gameType: null, gameStatus: null });
    const [filteredGames, setFilteredGames] = useState([]);
    const [gamesLoading, setGamesLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalGames, setTotalGames] = useState(0);
    const selectionRef = useRef({ filters, page: currentPage });
    const onErrorRef = useRef(onError);
    const requestRef = useRef(null);
    const mountedRef = useRef(false);

    useLayoutEffect(() => {
        selectionRef.current = { filters, page: currentPage };
        onErrorRef.current = onError;
    }, [filters, currentPage, onError]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            requestRef.current?.abort();
        };
    }, []);

    const fetchGames = useCallback(async (overrideFilters, page = selectionRef.current.page) => {
        if (!mountedRef.current) {
            return;
        }
        const selected = overrideFilters || selectionRef.current.filters;
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        if (!selected.season || !selected.week) {
            setGamesLoading(false);
            return;
        }
        setGamesLoading(true);
        try {
            const response = await getFilteredGames({
                filters: [],
                season: selected.season,
                week: selected.week,
                gameType: selected.gameType,
                gameStatus: selected.gameStatus,
                sort: 'MOST_TIME_REMAINING',
                page,
                size: pageSizeRef.current,
            });
            if (controller.signal.aborted) {
                return;
            }
            const allGames = response.content || [];
            setTotalGames(response.totalElements || allGames.length);
            setFilteredGames(allGames);
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error('Failed to load games:', error);
                onErrorRef.current?.('Failed to load games');
            }
        } finally {
            if (!controller.signal.aborted) {
                setGamesLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        requestRef.current?.abort();
        if (!initialSeason || !initialWeek) {
            setGamesLoading(false);
            return;
        }
        const nextFilters = { season: initialSeason, week: initialWeek, gameType: null, gameStatus: null };
        selectionRef.current = { filters: nextFilters, page: 0 };
        setFilters(nextFilters);
        setCurrentPage(0);
        fetchGames(nextFilters, 0);
    }, [initialSeason, initialWeek, fetchGames]);

    const handleFilterChange = useCallback(
        (field, value) => {
            const next = { ...selectionRef.current.filters, [field]: value === '' || value === 'ALL' ? null : value };
            selectionRef.current = { filters: next, page: 0 };
            setFilters(next);
            setCurrentPage(0);
            fetchGames(next, 0);
        },
        [fetchGames]
    );

    const handlePageChange = useCallback(
        (page) => {
            selectionRef.current = { ...selectionRef.current, page };
            setCurrentPage(page);
            fetchGames(selectionRef.current.filters, page);
        },
        [fetchGames]
    );

    const refetch = useCallback(() => fetchGames(), [fetchGames]);

    const firstPageSizeRef = useRef(true);
    useEffect(() => {
        if (firstPageSizeRef.current) {
            firstPageSizeRef.current = false;
            return;
        }
        selectionRef.current = { ...selectionRef.current, page: 0 };
        setCurrentPage(0);
        fetchGames(selectionRef.current.filters, 0);
    }, [pageSize, fetchGames]);

    return {
        filters,
        filteredGames,
        gamesLoading,
        currentPage,
        totalGames,
        pageSize,
        pageCount: Math.ceil(totalGames / pageSize),
        handleFilterChange,
        handlePageChange,
        refetch,
    };
};

export default useFilteredGames;
