import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getAllTeams } from '../api/teamApi'; // assuming this is the API call for fetching teams
import ConferenceFilter from '../components/filters/ConferenceFilter';
import TeamsTable from '../components/team/TeamsTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name'); // Default sorting by name
    const [selectedConference, setSelectedConference] = useState(''); // State for selected conference

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getAllTeams();
                setTeams(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load teams');
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleConferenceChange = (event) => {
        setSelectedConference(event.target.value);
        setPage(0); // Reset to the first page when filter changes
    };

    // Filtered teams based on the selected conference
    const filteredTeams = selectedConference
        ? teams.filter(team => team.conference === selectedConference)
        : teams;

    // Sorted teams
    const sortedTeams = filteredTeams.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
        return 0;
    });

    // Function to handle null values
    const handleNullValue = (value, fallback = '-') => {
        return value ? value : fallback;
    };

    const handleArrayValue = (array, fallback = '-') => {
        return array && array.length > 0 ? array.join(', ') : fallback;
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Teams
            </Typography>

            {/* Conference filter */}
            <ConferenceFilter selectedConference={selectedConference} onConferenceChange={handleConferenceChange} />

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <ErrorMessage message={error} />
            ) : (
                <TeamsTable
                    teams={sortedTeams}
                    order={order}
                    orderBy={orderBy}
                    handleRequestSort={handleRequestSort}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    handleNullValue={handleNullValue}
                    handleArrayValue={handleArrayValue}
                />
            )}
        </Box>
    );
};

export default Teams;