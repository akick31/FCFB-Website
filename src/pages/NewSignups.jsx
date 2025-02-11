import React, { useState, useEffect } from 'react';
import {CircularProgress, Box, Typography, Card, useTheme} from '@mui/material';
import NewSignupsTable from '../components/users/NewSignupsTable'; // Import the table component
import {useNavigate} from "react-router-dom";
import ErrorMessage from "../components/message/ErrorMessage";
import {getNewSignups} from "../api/newSignupsApi";
import {Header} from "../styles/GamesStyles";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import TeamsTable from "../components/team/TeamsTable";
import {getOpenTeams, getTeamByName} from "../api/teamApi";

const NewSignupsPage = ({ user }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [users, setNewSignups] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username'); // Assuming users are sorted by username initially
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        // If user is not loaded yet, just return (we're loading)
        if (!user || !user.role) {
            setLoading(true);
            return;
        }

        // Once the user is loaded, check the role
        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    useEffect(() => {
        // Fetch the list of users
        const fetchNewSignups = async () => {
            try {
                const response = await getNewSignups(); // Assuming this returns the list of users
                setNewSignups(response);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch users');
                setLoading(false);
            }
        };

        const fetchTeams = async () => {
            try {
                const data = await getOpenTeams();
                const teams = await Promise.all(data.map(team => getTeamByName(team)));
                setTeams(teams);
                setLoading(false);
            } catch (error) {
                setError('Failed to load teams');
                setLoading(false);
            }
        };

        fetchTeams();
        fetchNewSignups();
    }, []);

    const sortedTeams = teams.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
        return 0;
    });

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

    const handleTeamRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleTeamChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleTeamChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleNullValue = (value, fallback = '-') => {
        return value ? value : fallback;
    };

    const handleArrayValue = (array, fallback = '-') => {
        return array && array.length > 0 ? array.join(', ') : fallback;
    };

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Box sx={theme.root}>
            <Card sx={theme.standardCard}>
                <Header>
                    <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
                        New Signups
                    </Typography>
                </Header>
                <NewSignupsTable
                    users={users}
                    order={order}
                    orderBy={orderBy}
                    handleRequestSort={handleRequestSort}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
                <br/><br/>
                <Header>
                    <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 'bold'}}>
                        Open Teams
                    </Typography>
                </Header>

                {loading ? (
                    <LoadingSpinner/>
                ) : error ? (
                    <ErrorMessage message={error}/>
                ) : (
                    <TeamsTable
                        teams={sortedTeams}
                        order={order}
                        orderBy={orderBy}
                        handleRequestSort={handleTeamRequestSort}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        handleChangePage={handleTeamChangePage}
                        handleChangeRowsPerPage={handleTeamChangeRowsPerPage}
                        handleNullValue={handleNullValue}
                        handleArrayValue={handleArrayValue}
                    />
                )}
            </Card>
        </Box>
    );
};

export default NewSignupsPage;