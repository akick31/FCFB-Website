import React from "react";
import PropTypes from "prop-types";
import {
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemText,
    Grid,
    Button,
    Card,
    useTheme
} from "@mui/material";
import { formatConference, formatPlaybook } from "../../utils/formatText";
import { useNavigate } from "react-router-dom";

const TeamInfo = ({ team, user }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const formatRank = (rank) => rank === 0 ? "Unranked" : `#${rank}`;

    return (
        <Box elevation={3} sx={theme.root}>
            <Card sx={theme.standardCard}>
                {/* Team Header */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Avatar
                        src={team.logo}
                        alt={team.name}
                        sx={{ width: 120, height: 120, mr: 3 }}
                    />
                    <Box>
                        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
                            {team.name}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {formatConference(team.conference) || "No conference"}
                        </Typography>
                    </Box>
                </Box>

                {/* Coaches */}
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

                {/* Team Record */}
                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Team Record
                    </Typography>
                    <Typography variant="body1">
                        <strong>Current Record:</strong> {team.current_wins}-{team.current_losses} ({team.current_conference_wins}-{team.current_conference_losses})
                    </Typography>
                </Box>

                {/* Ranking Summary */}
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

                {/* Team Stats */}
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

                {/* Playoff Stats */}
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

                {/* Playbook Information */}
                <Box sx={theme.subCard}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Playbook Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Offensive Playbook:</strong> {formatPlaybook(team.offensive_playbook)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body1"><strong>Defensive Playbook:</strong> {formatPlaybook(team.defensive_playbook)}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Admin Section */}
                {(user.role === "ADMIN" || user.role === "CONFERENCE_COMMISSIONER") && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(`/modify-team/${team.id}`)}
                        >
                            Modify Team
                        </Button>
                    </Box>
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