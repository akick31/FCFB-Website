import React, { useState, useEffect } from 'react';
import { getFilteredGames } from '../../../api/gameApi';
import ScoreboardList from './ScoreboardList';

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
        fetchData();
    }, [filters]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    return (
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
        />
    );
};

export default PastGames;