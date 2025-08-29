import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Grid,
    Button,
    Card,
    useTheme, Alert, CircularProgress
} from "@mui/material";
import { formatConference, formatOffensivePlaybook, formatDefensivePlaybook } from "../../utils/formatText";
import { useNavigate } from "react-router-dom";
import {fireCoach, hireInterimCoach} from "../../api/teamApi";
import {HireInterimCoachByUserMenu} from "../menu/HireCoachMenu";
import {getAllUsers} from "../../api/userApi";
import ErrorMessage from "../message/ErrorMessage";

const TeamInfo = ({ team, user }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [coaches, setCoaches] = useState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [hiringInProgress, setHiringInProgress] = useState(false);
    const [contextError, setContextError] = useState(null);
    const formatRank = (rank) => rank === 0 ? "Unranked" : `#${rank}`;

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                const response = await getAllUsers();
                setCoaches(response);
                console.log(response)
                setLoading(false);
            } catch (error) {
                setLoading(false);
                setError(error.message);
            }
        };

        fetchCoaches();
    }, []);

    const handleCloseMenu = () => {
        setContextMenu(null);
        setContextError(null);
    };

    const handleHireInterimCoach = async () => {
        setHiringInProgress(true);
        try {
            await hireInterimCoach({
                team: team.name,
                discordId: selectedUser.discord_id,
                processedBy: user.username
            });
            setSuccess('Coach has been hired as interim.');
            handleCloseMenu();
            window.location.reload();
        } catch (error) {
            console.error('Failed to hire coach', error);
            setContextError(error.message);
        } finally {
            setHiringInProgress(false);
        }
    }

    const handleFireCoach = async () => {
        try {
            await fireCoach({
                    team: team.name,
                    processedBy: user.username
                }
            );
            setSuccess('Coaches have been fired.');
            window.location.reload();
        } catch (error) {
            console.error('Failed to fire coach', error);
            setError(error.message);
        }
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
        <Box elevation={3} sx={theme.root}>
            <Card sx={theme.standardCard}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                        sx={{
                            width: 120,
                            height: 120,
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1,
                        }}
                    >
                        <img
                            src={team.logo}
                            alt={team.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography variant="h4" component="h2" fontWeight="bold" ml={2}>
                            {team.name}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" ml={2}>
                            {formatConference(team.conference) || "No conference"}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Coaches
                    </Typography>
                    <List sx={{ pl: 2 }}>
                        {team.coach_discord_tags && team.coach_discord_tags.length > 0 ? (
                            team.coach_discord_tags.map((coach, index) => (
                                <ListItem key={index} sx={{ p: 0 }}>
                                    <ListItemText primary={coach} />
                                </ListItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No coaches listed.
                            </Typography>
                        )}
                    </List>
                </Box>

                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Team Record
                    </Typography>
                    <Typography variant="body1">
                        <strong>Current Record:</strong> {team.current_wins}-{team.current_losses} ({team.current_conference_wins}-{team.current_conference_losses})
                    </Typography>
                </Box>

                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Ranking
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Playoff Committee Ranking:</strong> {formatRank(team.playoff_committee_ranking)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Coaches Poll Ranking:</strong> {formatRank(team.coaches_poll_ranking)}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Team Stats
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Overall Wins:</strong> {team.overall_wins}</Typography>
                            <Typography variant="body1"><strong>Overall Losses:</strong> {team.overall_losses}</Typography>
                            <Typography variant="body1"><strong>Conference Wins:</strong> {team.overall_conference_wins}</Typography>
                            <Typography variant="body1"><strong>Conference Losses:</strong> {team.overall_conference_losses}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Conference Championship Wins:</strong> {team.conference_championship_wins}</Typography>
                            <Typography variant="body1"><strong>Conference Championship Losses:</strong> {team.conference_championship_losses}</Typography>
                            <Typography variant="body1"><strong>Bowl Wins:</strong> {team.bowl_wins}</Typography>
                            <Typography variant="body1"><strong>Bowl Losses:</strong> {team.bowl_losses}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Playoff Stats
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Playoff Wins:</strong> {team.playoff_wins}</Typography>
                            <Typography variant="body1"><strong>Playoff Losses:</strong> {team.playoff_losses}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>National Championship Wins:</strong> {team.national_championship_wins}</Typography>
                            <Typography variant="body1"><strong>National Championship Losses:</strong> {team.national_championship_losses}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Playbook Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Offensive Playbook:</strong> {formatOffensivePlaybook(team.offensive_playbook)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Defensive Playbook:</strong> {formatDefensivePlaybook(team.defensive_playbook)}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {(user.role === "ADMIN" || user.role === "CONFERENCE_COMMISSIONER") && (
                    <Grid container spacing={2} justifyContent="center" sx={{ pb: 3 }}>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/modify-team/${team.id}`)}
                                fullWidth
                            >
                                Modify Team
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={(e) => setContextMenu({ mouseX: e.clientX, mouseY: e.clientY })}
                                fullWidth
                            >
                                Hire Interim Coach
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleFireCoach}
                                fullWidth
                            >
                                Fire Coach
                            </Button>
                        </Grid>
                        {contextMenu && (
                            <HireInterimCoachByUserMenu
                                contextMenu={contextMenu}
                                handleCloseMenu={() => setContextMenu(null)}
                                coaches={coaches}
                                handleHireCoach={handleHireInterimCoach}
                                contextError={contextError}
                                hiringInProgress={hiringInProgress}
                                selectedUser={selectedUser}
                                setSelectedUser={setSelectedUser}
                            />
                        )}
                    </Grid>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
            </Card>
        </Box>
    );
};

TeamInfo.propTypes = {
    team: PropTypes.shape({
        logo: PropTypes.string,
        name: PropTypes.string.isRequired,
        conference: PropTypes.string,
        current_wins: PropTypes.number.isRequired,
        current_losses: PropTypes.number.isRequired,
        current_conference_wins: PropTypes.number.isRequired,
        current_conference_losses: PropTypes.number.isRequired,
        overall_wins: PropTypes.number.isRequired,
        overall_losses: PropTypes.number.isRequired,
        overall_conference_wins: PropTypes.number.isRequired,
        overall_conference_losses: PropTypes.number.isRequired,
        conference_championship_wins: PropTypes.number.isRequired,
        conference_championship_losses: PropTypes.number.isRequired,
        bowl_wins: PropTypes.number.isRequired,
        bowl_losses: PropTypes.number.isRequired,
        playoff_wins: PropTypes.number.isRequired,
        playoff_losses: PropTypes.number.isRequired,
        national_championship_wins: PropTypes.number.isRequired,
        national_championship_losses: PropTypes.number.isRequired,
        offensive_playbook: PropTypes.string.isRequired,
        defensive_playbook: PropTypes.string.isRequired,
        coach_discord_tags: PropTypes.arrayOf(PropTypes.string),
        playoff_committee_ranking: PropTypes.number.isRequired,
        coaches_poll_ranking: PropTypes.number.isRequired,
    }).isRequired,
    user: PropTypes.object.isRequired,
};

export default TeamInfo;