import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, Avatar } from "@mui/material";
import PropTypes from 'prop-types';
import { getTeamByName } from "../../api/teamApi";
import { formatConference, formatGameType, formatPlaybook } from '../../utils/formatText';

const GameInfo = ({ game }) => {
    const [homeTeam, setHomeTeam] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch team details
    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            if (game) {
                try {
                    const homeTeamResponse = await getTeamByName(game.home_team);
                    const awayTeamResponse = await getTeamByName(game.away_team);
                    setHomeTeam(homeTeamResponse);
                    setAwayTeam(awayTeamResponse);
                } catch (error) {
                    console.error("Failed to fetch team details:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchTeams();
    }, [game]);

    if (!game || loading) return null;

    // Helper functions
    const formatRecord = (wins, losses) => `${wins}-${losses}`;
    const formatRank = (rank) => rank === 0 ? "Unranked" : `#${rank}`;
    const formatCoinTossWinner = (winner) => winner === "HOME" ? game.home_team : game.away_team;
    const formatWaitingOn = (waitingOn) => waitingOn === "HOME" ? game.home_team : game.away_team;

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            {/* Team Info Sections */}
            <Grid container spacing={3}>
                {/* Home Team Details */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar src={homeTeam?.logo} alt={game.home_team} sx={{ width: 40, height: 40, mr: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {game.home_team}
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            <strong>Coaches:</strong> {game.home_coaches?.join(", ") || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Offensive Playbook:</strong> {formatPlaybook(game.home_offensive_playbook)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Defensive Playbook:</strong> {formatPlaybook(game.home_defensive_playbook)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Record:</strong> {formatRecord(game.home_wins, game.home_losses)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Rank:</strong> {formatRank(game.home_team_rank)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Conference:</strong> {formatConference(homeTeam?.conference)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Away Team Details */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar src={awayTeam?.logo} alt={game.away_team} sx={{ width: 40, height: 40, mr: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {game.away_team}
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            <strong>Coaches:</strong> {game.away_coaches?.join(", ") || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Offensive Playbook:</strong> {formatPlaybook(game.away_offensive_playbook)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Defensive Playbook:</strong> {formatPlaybook(game.away_defensive_playbook)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Record:</strong> {formatRecord(game.away_wins, game.away_losses)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Rank:</strong> {formatRank(game.away_team_rank)}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Conference:</strong> {formatConference(awayTeam?.conference)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Game Details Section */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#004260' }}>
                    Game Details
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Game ID:</strong> {game.game_id || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Season:</strong> {game.season || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Week:</strong> {game.week || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Game Type:</strong> {formatGameType(game.game_type)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Coin Toss Winner:</strong> {formatCoinTossWinner(game.coin_toss_winner)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Coin Toss Choice:</strong> {game.coin_toss_choice || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Game Timer:</strong> {game.game_timer || "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Waiting On:</strong> {formatWaitingOn(game.waiting_on)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2">
                            <strong>Number of Plays:</strong> {game.num_plays || "N/A"}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

GameInfo.propTypes = {
    game: PropTypes.object.isRequired,
};

export default GameInfo;