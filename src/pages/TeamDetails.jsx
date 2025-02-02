import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { getTeamById } from "../api/teamApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TeamSummary from "../components/team/TeamSummary";

const TeamDetails = ({ user }) => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await getTeamById(teamId);
                setTeam(response);
                setLoading(false);
            } catch (error) {
                setError("Failed to load team");
                setLoading(false);
            }
        };
        fetchTeam();
    }, [teamId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Box sx={{ width: '100%', padding: 2 }}>
            <Typography variant="h4" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                Team Details
            </Typography>

            {/* Team Summary Section */}
            {team && <TeamSummary team={team} />}

            {/* Admin Section */}
            {(user.role === "ADMIN" ||
                user.role === "CONFERENCE_COMMISSIONER") && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        marginTop: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/modify-team/${teamId}`)}
                    >
                        Modify Team
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default TeamDetails;