import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Typography, Card, useTheme } from '@mui/material';
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/message/ErrorMessage";
import { Header } from "../../styles/GamesStyles";
import LoadingSpinner from "../../components/icons/LoadingSpinner";
import TeamsTable from "../../components/team/TeamsTable";
import { getOpenTeams, getTeamByName, hireCoach } from "../../api/teamApi";
import { getFreeAgents } from "../../api/userApi";
import { HireCoachByUserMenu } from "../../components/menu/HireCoachMenu";

const OpenTeamsPage = ({ user }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [freeAgentCoaches, setFreeAgentCoaches] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hiringInProgress, setHiringInProgress] = useState(false);

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
        if (!user || !user.role) {
            setLoading(true);
            return;
        }

        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [teamsResponse, freeAgentsResponse] = await Promise.all([
                getOpenTeams(),
                getFreeAgents()
            ]);

            const teamsData = await Promise.all(
                teamsResponse.map(team => getTeamByName(team))
            );

            setTeams(teamsData);
            setFreeAgentCoaches(freeAgentsResponse);
            setLoading(false);
        } catch (error) {
            setError('Failed to load data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRowClick = (event, user, teamName) => {
        event.preventDefault();
        setSelectedUser(user);
        setSelectedTeam(teams.find(t => t.name === teamName));
        setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
        });
    };

    const handleCloseMenu = () => {
        setContextMenu(null);
        setSelectedTeam('');
        setSelectedPosition('');
        setContextError(null);
    };

    const handleHireCoach = async () => {
        if (!selectedTeam || !selectedPosition) {
            setContextError('Please select both a team and position');
            return;
        }

        setHiringInProgress(true);
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
            setHiringInProgress(false);
        }
    };

    const sortedTeams = teams.sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
        return 0;
    });

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
                        handleRowClick={handleRowClick}
                    />
                )}
                {selectedTeam && (
                    <HireCoachByUserMenu
                        contextMenu={contextMenu}
                        handleCloseMenu={handleCloseMenu}
                        coaches={freeAgentCoaches}
                        selectedTeam={selectedTeam}
                        selectedPosition={selectedPosition}
                        setSelectedPosition={setSelectedPosition}
                        handleHireCoach={handleHireCoach}
                        contextError={contextError}
                        hiringInProgress={hiringInProgress}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                    />
                )}
            </Card>
        </Box>
    );
};

export default OpenTeamsPage;