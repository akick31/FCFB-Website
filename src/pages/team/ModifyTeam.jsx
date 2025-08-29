import React, {useEffect, useState} from 'react';
import ModifyTeamForm from '../../components/forms/ModifyTeamForm';
import {useNavigate, useParams} from "react-router-dom";
import {getTeamById} from "../../api/teamApi";
import LoadingSpinner from "../../components/icons/LoadingSpinner";
import ErrorMessage from "../../components/message/ErrorMessage";

const ModifyTeam = ({ user }) => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user.role !== "ADMIN" &&
            user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        }
    }, [user.role, navigate]);

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
        <ModifyTeamForm team={team}/>
    );
}

export default ModifyTeam;
