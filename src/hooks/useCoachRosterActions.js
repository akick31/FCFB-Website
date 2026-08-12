import { useState } from 'react';
import { hireCoach, hireInterimCoach, fireSingleCoach } from '../api/teamApi';

const useCoachRosterActions = ({ user, getRosterForTeam, onChanged }) => {
    const [hireDialogOpen, setHireDialogOpen] = useState(false);
    const [fireTarget, setFireTarget] = useState(null);
    const [firePickerTeam, setFirePickerTeam] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [processing, setProcessing] = useState(false);
    const [dialogError, setDialogError] = useState('');

    const handleFireClick = (team) => {
        const roster = getRosterForTeam(team);
        if (roster.length === 1) {
            setFireTarget({ team, coach: roster[0] });
        } else if (roster.length > 1) {
            setFirePickerTeam(team);
        }
    };

    const handleHireCoach = (team) => {
        setSelectedTeam(team);
        setSelectedUser(null);
        setSelectedPosition('');
        setDialogError('');
        setHireDialogOpen(true);
    };

    const handleHireSubmit = async () => {
        if (!selectedUser || !selectedPosition) {
            setDialogError('Please select both a user and position');
            return;
        }
        setProcessing(true);
        setDialogError('');
        try {
            if (!selectedUser.discord_id) {
                setDialogError('Selected user does not have a Discord ID');
                return;
            }
            await hireCoach({ team: selectedTeam.name, discordId: selectedUser.discord_id, coachPosition: selectedPosition, processedBy: user.username });
            setHireDialogOpen(false);
            await onChanged();
        } catch (err) {
            setDialogError(err.message || 'Failed to hire coach');
        } finally {
            setProcessing(false);
        }
    };

    const handleHireInterimSubmit = async () => {
        if (!selectedUser) {
            setDialogError('Please select a user');
            return;
        }
        setProcessing(true);
        setDialogError('');
        try {
            if (!selectedUser.discord_id) {
                setDialogError('Selected user does not have a Discord ID');
                return;
            }
            await hireInterimCoach({ team: selectedTeam.name, discordId: selectedUser.discord_id, processedBy: user.username });
            setHireDialogOpen(false);
            await onChanged();
        } catch (err) {
            setDialogError(err.message || 'Failed to hire interim coach');
        } finally {
            setProcessing(false);
        }
    };

    const handleFireSubmit = async () => {
        if (!fireTarget) return;
        setProcessing(true);
        setDialogError('');
        try {
            await fireSingleCoach({ team: fireTarget.team.name, discordId: fireTarget.coach.discordId, coachPosition: fireTarget.coach.position, processedBy: user.username });
            setFireTarget(null);
            await onChanged();
        } catch (err) {
            setDialogError(err.message || 'Failed to fire coach');
        } finally {
            setProcessing(false);
        }
    };

    const selectFireFromPicker = (coach) => {
        setFireTarget({ team: firePickerTeam, coach });
        setFirePickerTeam(null);
    };

    return {
        hireDialogOpen, setHireDialogOpen,
        fireTarget, setFireTarget,
        firePickerTeam, setFirePickerTeam,
        selectedTeam,
        selectedUser, setSelectedUser,
        selectedPosition, setSelectedPosition,
        processing, dialogError,
        handleFireClick, handleHireCoach, handleHireSubmit, handleHireInterimSubmit, handleFireSubmit,
        selectFireFromPicker,
    };
};

export default useCoachRosterActions;
