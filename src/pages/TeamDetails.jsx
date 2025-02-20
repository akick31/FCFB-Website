import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Box, CircularProgress} from "@mui/material";
import { getTeamById } from "../api/teamApi";
import ErrorMessage from "../components/message/ErrorMessage";
import TeamInfo from "../components/team/TeamInfo";

const TeamDetails = ({ user }) => {
    const navigate = useNavigate();
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user.role || !team) {
            setLoading(true);
            return;
        }

        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setLoading(false);
        }
    }, [user, team, navigate]);

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
        <TeamInfo
            team={team}
            user={user}
        />
    );
};

export default TeamDetails;