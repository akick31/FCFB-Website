import React, { useState, useEffect, useRef } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import EditDialog from '../ui/EditDialog';
import Panel from '../ui/Panel';
import FormField from './form/FormField';
import TextInputField from './form/TextInputField';
import TeamSelect from '../ui/TeamSelect';
import SelectField from './form/SelectField';
import NumberField from './form/NumberField';
import { getUserByUsernameOrCoachName, updateUser } from '../../api/userApi';
import { getAllTeams, hireCoach, fireSingleCoach } from '../../api/teamApi';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatRole, formatPosition } from '../../utils/formatText';
import { formGridSx, primaryButtonSx } from '../../styles/controls';

const ROLES = ['USER', 'CONFERENCE_COMMISSIONER', 'ADMIN'];
const POSITIONS = ['HEAD_COACH', 'OFFENSIVE_COORDINATOR', 'DEFENSIVE_COORDINATOR', 'RETIRED'];

const RECORD_FIELDS = [
    ['wins', 'Wins'],
    ['losses', 'Losses'],
    ['conference_wins', 'Conference wins'],
    ['conference_losses', 'Conference losses'],
    ['conference_championship_wins', 'Conf champ wins'],
    ['conference_championship_losses', 'Conf champ losses'],
    ['bowl_wins', 'Bowl wins'],
    ['bowl_losses', 'Bowl losses'],
    ['playoff_wins', 'Playoff wins'],
    ['playoff_losses', 'Playoff losses'],
    ['national_championship_wins', 'National champ wins'],
    ['national_championship_losses', 'National champ losses'],
];

const CoachEditDialog = ({ username, user: adminUser, onClose, onSaved }) => {
    const [coach, setCoach] = useState(null);
    const [originalTeam, setOriginalTeam] = useState(null);
    const [originalPosition, setOriginalPosition] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const scopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        setLoading(true);
        setSaving(false);
        setError(null);
        setCoach(null);
        const fetchData = async () => {
            try {
                const [found, allTeams] = await Promise.all([
                    getUserByUsernameOrCoachName(username).catch(() => null),
                    getAllTeams().catch(() => []),
                ]);
                if (!scope.active) {
                    return;
                }
                setCoach(found || null);
                setOriginalTeam(found?.team ?? null);
                setOriginalPosition(found?.position ?? null);
                setTeams(
                    allTeams
                        .filter((team) => team.active)
                        .map((team) => team.name)
                        .sort((a, b) => a.localeCompare(b))
                );
                if (!found) {
                    setError('Coach not found');
                }
            } catch {
                if (scope.active) {
                    console.error('Failed to load coach');
                    setError('Failed to load coach');
                }
            } finally {
                if (scope.active) {
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => {
            scope.active = false;
        };
    }, [username]);

    const handleChange = (field, value) => setCoach((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        const scope = scopeRef.current;
        setSaving(true);
        setError(null);
        try {
            const nextTeam = coach.team || null;
            if (nextTeam !== originalTeam) {
                if (!coach.discord_id) {
                    setError(
                        'Cannot change team: this coach has no Discord ID on file, so the move can’t be logged to coaching history. Link a Discord ID first, or use Team Management.'
                    );
                    setSaving(false);
                    return;
                }
                if (nextTeam) {
                    await hireCoach({
                        team: nextTeam,
                        discordId: coach.discord_id,
                        coachPosition: coach.position,
                        processedBy: adminUser?.username,
                    });
                } else if (originalTeam) {
                    await fireSingleCoach({
                        team: originalTeam,
                        discordId: coach.discord_id,
                        coachPosition: originalPosition || 'HEAD_COACH',
                        processedBy: adminUser?.username,
                    });
                }
            }
            await updateUser(coach);
            if (scope.active) {
                onSaved();
            }
        } catch (err) {
            if (scope.active) {
                setError(err.message || 'Failed to update coach');
            }
        } finally {
            if (scope.active) {
                setSaving(false);
            }
        }
    };

    const isFullAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'ADMIN';
    const roleFieldDisabled = !isFullAdmin && coach?.role === 'ADMIN';
    const visibleRoles = isFullAdmin || roleFieldDisabled ? ROLES : ROLES.filter((role) => role !== 'ADMIN');

    const saveButton = coach && (
        <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={primaryButtonSx}>
            {saving ? 'Saving...' : 'Save changes'}
        </Box>
    );

    const tabs = coach && [
        {
            value: 'profile',
            label: 'Profile',
            content: (
                <>
                    <Panel header="Basic information">
                        <Box sx={formGridSx}>
                            <TextInputField
                                label="Coach name"
                                value={coach.coach_name}
                                onChange={(value) => handleChange('coach_name', value)}
                            />
                            <TextInputField
                                label="Discord tag"
                                value={coach.discord_tag}
                                onChange={(value) => handleChange('discord_tag', value)}
                            />
                            <SelectField
                                label="Role"
                                value={coach.role}
                                onChange={(value) => handleChange('role', value)}
                                options={visibleRoles.map((role) => ({ value: role, label: formatRole(role) }))}
                                disabled={roleFieldDisabled}
                                title={roleFieldDisabled ? 'Only an admin can change another admin’s role' : undefined}
                            />
                            <SelectField
                                label="Position"
                                value={coach.position}
                                onChange={(value) => handleChange('position', value)}
                                options={POSITIONS.map((position) => ({
                                    value: position,
                                    label: formatPosition(position),
                                }))}
                            />
                            <FormField label="Team">
                                <TeamSelect
                                    value={coach.team || ''}
                                    onChange={(value) => handleChange('team', value || null)}
                                    teams={teams}
                                    noneLabel="None (free agent)"
                                    ariaLabel="Team"
                                />
                            </FormField>
                        </Box>
                    </Panel>

                    <Panel header="Playbooks">
                        <Box sx={formGridSx}>
                            <SelectField
                                label="Offensive playbook"
                                value={coach.offensive_playbook}
                                onChange={(value) => handleChange('offensive_playbook', value)}
                                options={OFFENSIVE_PLAYBOOKS.map((playbook) => ({
                                    value: playbook,
                                    label: formatOffensivePlaybook(playbook),
                                }))}
                            />
                            <SelectField
                                label="Defensive playbook"
                                value={coach.defensive_playbook}
                                onChange={(value) => handleChange('defensive_playbook', value)}
                                options={DEFENSIVE_PLAYBOOKS.map((playbook) => ({
                                    value: playbook,
                                    label: formatDefensivePlaybook(playbook),
                                }))}
                            />
                        </Box>
                    </Panel>
                </>
            ),
        },
        {
            value: 'record',
            label: 'Record',
            content: (
                <Panel header="Record">
                    <Box sx={formGridSx}>
                        {RECORD_FIELDS.map(([key, label]) => (
                            <NumberField
                                key={key}
                                label={label}
                                value={coach[key]}
                                onChange={(value) => handleChange(key, value)}
                            />
                        ))}
                    </Box>
                </Panel>
            ),
        },
    ];

    return (
        <EditDialog
            open
            onClose={onClose}
            title={coach ? `Edit coach: ${coach.coach_name || coach.username}` : 'Edit coach'}
            actions={saveButton}
            tabs={!loading && coach ? tabs : undefined}
        >
            {error && <Alert severity="error">{error}</Alert>}
            {loading && (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
        </EditDialog>
    );
};

CoachEditDialog.propTypes = {
    username: PropTypes.string.isRequired,
    user: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
};

export default CoachEditDialog;
