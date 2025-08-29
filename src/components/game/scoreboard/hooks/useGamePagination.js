import { useState } from 'react';

export const useGamePagination = (initialRowsPerPage = 10) => {
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        return newRowsPerPage; // Return for parent component to update filters
    };

    const getTotalPages = (totalElements) => {
        return Math.ceil(totalElements / rowsPerPage);
    };

    return {
        rowsPerPage,
        setRowsPerPage,
        handleRowsPerPageChange,
        getTotalPages
    };
}; 