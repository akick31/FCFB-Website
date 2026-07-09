import { useState } from 'react';

export const useGameFilters = (initialFilters, setParentFilters) => {
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    const handleFilterChange = () => {};

    const handleFilterApply = (newFilters) => {
        if (setParentFilters) {
            setParentFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
        }
        setFilterMenuOpen(false);
    };

    const openFilterMenu = () => {
        setFilterMenuOpen(true);
    };

    const closeFilterMenu = () => {
        setFilterMenuOpen(false);
    };

    const resetFilters = () => {
        if (setParentFilters) {
            setParentFilters(initialFilters);
        }
        setFilterMenuOpen(false);
    };

    return {
        filterMenuOpen,
        handleFilterChange,
        handleFilterApply,
        openFilterMenu,
        closeFilterMenu,
        resetFilters
    };
}; 