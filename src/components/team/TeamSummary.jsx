import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Avatar, List, ListItem, ListItemText, Grid, Paper } from "@mui/material";
import {formatConference, formatPlaybook} from "../../utils/formatText";

const TeamSummary = ({ team }) => (
    <Box sx={{ padding: 4, maxWidth: "900px", margin: "0 auto" }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
            {/* Team Header */}
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
                <Avatar
                    src={team.logo}
                    alt={team.name}
                    sx={{ width: 120, height: 120, marginRight: 3 }}
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

            {/* Team Record */}
            <Grid container spacing={3} sx={{ marginBottom: 4 }}>
                <Grid item xs={6}>
                    <Typography variant="h6" fontWeight="bold">
                        <strong>Record:</strong>
                    </Typography>
                    <Typography variant="body1">{team.current_wins}-{team.current_losses}</Typography>
                </Grid>
            </Grid>

            {/* Team Stats */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h5" component="h3" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                    Team Stats
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Overall Wins:</strong> {team.overall_wins}</Typography>
                        <Typography variant="body1"><strong>Overall Losses:</strong> {team.overall_losses}</Typography>
                        <Typography variant="body1"><strong>Conference Wins:</strong> {team.overall_conference_wins}</Typography>
                        <Typography variant="body1"><strong>Conference Losses:</strong> {team.overall_conference_losses}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Conference Championship Wins:</strong> {team.conference_championship_wins}</Typography>
                        <Typography variant="body1"><strong>Conference Championship Losses:</strong> {team.conference_championship_losses}</Typography>
                        <Typography variant="body1"><strong>Bowl Wins:</strong> {team.bowl_wins}</Typography>
                        <Typography variant="body1"><strong>Bowl Losses:</strong> {team.bowl_losses}</Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Playoffs */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h5" component="h3" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                    Playoff Stats
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Playoff Wins:</strong> {team.playoff_wins}</Typography>
                        <Typography variant="body1"><strong>Playoff Losses:</strong> {team.playoff_losses}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>National Championship Wins:</strong> {team.national_championship_wins}</Typography>
                        <Typography variant="body1"><strong>National Championship Losses:</strong> {team.national_championship_losses}</Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Playbook Information */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h5" component="h3" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                    Playbook Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Offensive Playbook:</strong> {formatPlaybook(team.offensive_playbook)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Defensive Playbook:</strong> {formatPlaybook(team.defensive_playbook)}</Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Coaches */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h5" component="h3" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                    Coaches
                </Typography>
                <List sx={{ paddingLeft: 2 }}>
                    {team.coach_discord_tags && team.coach_discord_tags.length > 0 ? (
                        team.coach_discord_tags.map((coach, index) => (
                            <ListItem key={index} sx={{ padding: 0 }}>
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

            {/* Record Summary */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h5" component="h3" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                    Record Summary
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Playoff Committee Ranking:</strong> {team.playoff_committee_ranking}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1"><strong>Coaches Poll Ranking:</strong> {team.coaches_poll_ranking}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    </Box>
);

TeamSummary.propTypes = {
    team: PropTypes.shape({
        logo: PropTypes.string,
        name: PropTypes.string.isRequired,
        conference: PropTypes.string,
        current_wins: PropTypes.number.isRequired,
        current_losses: PropTypes.number.isRequired,
        overall_wins: PropTypes.number.isRequired,
        overall_losses: PropTypes.number.isRequired,
        current_conference_wins: PropTypes.number.isRequired,
        current_conference_losses: PropTypes.number.isRequired,
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
        coaches_poll_ranking: PropTypes.number.isRequired
    }).isRequired
};

export default TeamSummary;