import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Typography, Card, useTheme } from '@mui/material';
import NewSignupsTable from '../components/users/NewSignupsTable';
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/message/ErrorMessage";
import { getNewSignups } from "../api/newSignupsApi";
import { Header } from "../styles/GamesStyles";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import TeamsTable from "../components/team/TeamsTable";
import { getOpenTeams, getTeamByName, hireCoach } from "../api/teamApi";
import { HireCoachByTeamMenu } from "../components/menu/HireCoachMenu";

const NewSignupsPage = ({ user }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [users, setNewSignups] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hiringInProgress, setHiringInProgress] = useState(false); // New state for hire process

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [contextMenu, setContextMenu] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [contextError, setContextError] = useState(null);

    useEffect(() => {
        if (!user || (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER")) {
            navigate('*');
        } else {
            setLoading(false);
        }
        if (!user || !user.role) {
            setLoading(true);
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [signupsResponse, teamsResponse] = await Promise.all([
                getNewSignups(),
                getOpenTeams()
            ]);

            const teamsData = await Promise.all(
                teamsResponse.map(team => getTeamByName(team))
            );

            setNewSignups(signupsResponse);
            setTeams(teamsData);
            setLoading(false);
        } catch (error) {
            setError('Failed to load data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRowClick = (event, user) => {
        event.preventDefault();
        setSelectedUser(user);
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    };

    const handleTeamRowClick = (event, user, teamName, teamId) => {
        navigate(`/team-details/${teamId}`);
    };

    const handleCloseMenu = () => {
        setContextMenu(null);
        setSelectedTeam('');
        setSelectedPosition('');
        setContextError(null);
    };

    const handleHireCoach = async () => {
        if (!selectedUser || !selectedTeam || !selectedPosition) {
            setContextError('Please select both a team and position');
            return;
        }

        setHiringInProgress(true);  // Set loading state to true when hiring starts
        try {
            await hireCoach({
                team: selectedTeam.name,
                discordId: selectedUser.discord_id,
                coachPosition: selectedPosition,
                processedBy: user.username
            });

            await fetchData();
            handleCloseMenu();
        } catch (error) {
            setContextError(error.message);
        } finally {
            setHiringInProgress(false);  // Set loading state back to false
        }
    };

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
                    onRowClick={handleRowClick}
                />
                <HireCoachByTeamMenu
                    contextMenu={contextMenu}
                    handleCloseMenu={handleCloseMenu}
                    teams={teams}
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    selectedPosition={selectedPosition}
                    setSelectedPosition={setSelectedPosition}
                    handleHireCoach={handleHireCoach}
                    contextError={contextError}
                    hiringInProgress={hiringInProgress}
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
                        handleRowClick={handleTeamRowClick}
                    />
                )}
            </Card>
        </Box>
    );
};

export default NewSignupsPage;