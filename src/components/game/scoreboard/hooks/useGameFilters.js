import { useState } from 'react';

export const useGameFilters = (initialFilters, setParentFilters) => {
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    const handleFilterChange = (newFilters) => {
        // This is called when individual filters change in the FilterMenu
        // We don't need to do anything here as the FilterMenu manages its own state
    };

    const handleFilterApply = (newFilters) => {
        // Apply the new filters to the parent component
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