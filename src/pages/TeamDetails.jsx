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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
            {user.role !== "USER" && (
                <Box sx={{ textAlign: 'center', marginTop: 4 }}>
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