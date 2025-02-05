import React, { useEffect, useState } from 'react';
import {Box, Card, Typography, useTheme} from '@mui/material';
import { getAllTeams } from '../api/teamApi'; // assuming this is the API call for fetching teams
import ConferenceDropdown from '../components/dropdown/ConferenceDropdown';
import TeamsTable from '../components/team/TeamsTable';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import ErrorMessage from '../components/message/ErrorMessage';
import {Header} from "../styles/GamesStyles";

const Teams = () => {
    const theme = useTheme()
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
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
        <Box sx={theme.root}>
            <Card sx={theme.standardCard}>
                <Header>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Teams
                    </Typography>
                </Header>

                {/* Conference filter */}
                <ConferenceDropdown
                    value={selectedConference || ""}
                    onChange={handleConferenceChange}
                />

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
            </Card>
        </Box>
    );
};

export default Teams;