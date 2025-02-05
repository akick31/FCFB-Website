import React, { useState, useEffect } from 'react';
import { getFilteredScorebugs } from '../../../api/scorebugApi';
import ScorebugGrid from './ScorebugGrid';

const OngoingGames = ({ menuOpen, menuAnchor, onMenuToggle }) => {
    const [games, setGames] = useState([]);
    const [totalGames, setTotalGames] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        filters: [],
        category: 'ONGOING',
        sort: 'CLOSEST_TO_END',
        conference: null,
        season: null,
        week: null,
        page: 0,
        size: 12,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getFilteredScorebugs({
                    filters: filters.filters,
                    week: filters.week,
                    season: filters.season,
                    conference: filters.conference,
                    category: 'ONGOING',
                    sort: filters.sort,
                    page: filters.page,
                    size: filters.size,
                });
                setGames(response.content);
                setTotalGames(response["total_elements"]);
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
        <ScorebugGrid
            games={games}
            onPageChange={handlePageChange}
            totalGames={totalGames}
            currentPage={filters.page}
            category={filters.category}
            setFilters={setFilters}
            onMenuToggle={onMenuToggle}
            menuOpen={menuOpen}
            menuAnchor={menuAnchor}
            loading={loading}
            error={error}
        />
    );
};

export default OngoingGames;