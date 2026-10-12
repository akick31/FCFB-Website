import { useEffect, useRef, useState } from 'react';
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

    const scopeRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    const resetDialogRequest = () => {
        dialogRef.current = {};
        setProcessing(false);
        setDialogError('');
    };

    const changeHireDialogOpen = (open) => {
        resetDialogRequest();
        setHireDialogOpen(open);
    };

    const changeFireTarget = (target) => {
        resetDialogRequest();
        setFireTarget(target);
    };

    const changeFirePickerTeam = (team) => {
        resetDialogRequest();
        setFirePickerTeam(team);
    };

    const handleFireClick = (team) => {
        const roster = getRosterForTeam(team);
        if (roster.length === 1) {
            changeFireTarget({ team, coach: roster[0] });
        } else if (roster.length > 1) {
            changeFirePickerTeam(team);
        }
    };

    const handleHireCoach = (team) => {
        setSelectedTeam(team);
        setSelectedUser(null);
        setSelectedPosition('');
        changeHireDialogOpen(true);
    };

    const saveRosterChange = async (write, closeDialog, failureMessage) => {
        const scope = scopeRef.current;
        const dialog = dialogRef.current;
        const isCurrent = () => scope.active && dialogRef.current === dialog;
        setProcessing(true);
        setDialogError('');
        try {
            await write();
            if (isCurrent()) {
                closeDialog();
            }
            if (scope.active) {
                await onChanged();
            }
        } catch (err) {
            if (isCurrent()) {
                setDialogError(err.message || failureMessage);
            }
        } finally {
            if (isCurrent()) {
                setProcessing(false);
            }
        }
    };

    const handleHireSubmit = async () => {
        if (!selectedUser || !selectedPosition) {
            setDialogError('Please select both a user and position');
            return;
        }
        if (!selectedUser.discord_id) {
            setDialogError('Selected user does not have a Discord ID');
            return;
        }
        await saveRosterChange(
            () =>
                hireCoach({
                    team: selectedTeam.name,
                    discordId: selectedUser.discord_id,
                    coachPosition: selectedPosition,
                    processedBy: user.username,
                }),
            () => setHireDialogOpen(false),
            'Failed to hire coach'
        );
    };

    const handleHireInterimSubmit = async () => {
        if (!selectedUser) {
            setDialogError('Please select a user');
            return;
        }
        if (!selectedUser.discord_id) {
            setDialogError('Selected user does not have a Discord ID');
            return;
        }
        await saveRosterChange(
            () =>
                hireInterimCoach({
                    team: selectedTeam.name,
                    discordId: selectedUser.discord_id,
                    processedBy: user.username,
                }),
            () => setHireDialogOpen(false),
            'Failed to hire interim coach'
        );
    };

    const handleFireSubmit = async () => {
        if (!fireTarget) {
            return;
        }
        await saveRosterChange(
            () =>
                fireSingleCoach({
                    team: fireTarget.team.name,
                    discordId: fireTarget.coach.discordId,
                    coachPosition: fireTarget.coach.position,
                    processedBy: user.username,
                }),
            () => setFireTarget(null),
            'Failed to fire coach'
        );
    };

    const selectFireFromPicker = (coach) => {
        changeFireTarget({ team: firePickerTeam, coach });
        setFirePickerTeam(null);
    };

    return {
        hireDialogOpen,
        setHireDialogOpen: changeHireDialogOpen,
        fireTarget,
        setFireTarget: changeFireTarget,
        firePickerTeam,
        setFirePickerTeam: changeFirePickerTeam,
        selectedTeam,
        selectedUser,
        setSelectedUser,
        selectedPosition,
        setSelectedPosition,
        processing,
        dialogError,
        handleFireClick,
        handleHireCoach,
        handleHireSubmit,
        handleHireInterimSubmit,
        handleFireSubmit,
        selectFireFromPicker,
    };
};

export default useCoachRosterActions;
