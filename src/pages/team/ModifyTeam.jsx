import React, { useEffect, useState } from 'react';
import ModifyTeamForm from '../../components/forms/ModifyTeamForm';
import { useParams } from 'react-router-dom';
import { getTeamById } from '../../api/teamApi';
import LoadingSpinner from '../../components/icons/LoadingSpinner';
import ErrorMessage from '../../components/message/ErrorMessage';

const ModifyTeam = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        const fetchTeam = async () => {
            try {
                const response = await getTeamById(teamId);
                if (active) {
                    setTeam(response);
                }
            } catch {
                if (active) {
                    setError('Failed to load team');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };
        fetchTeam();
        return () => {
            active = false;
        };
    }, [teamId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return <ModifyTeamForm team={team} />;
};

export default ModifyTeam;
