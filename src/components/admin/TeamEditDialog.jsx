import React, { useState, useEffect, useRef } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import EditDialog from '../ui/EditDialog';
import Panel from '../ui/Panel';
import Toggle from '../ui/Toggle';
import TeamName from '../ui/TeamName';
import LogoUrlField from './LogoUrlField';
import FormField from './form/FormField';
import TextInputField from './form/TextInputField';
import SelectField from './form/SelectField';
import NumberField from './form/NumberField';
import ColorField from './form/ColorField';
import StadiumPicker from '../stadium/StadiumPicker';
import { getTeamById, updateTeam } from '../../api/teamApi';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS, SUBDIVISIONS } from '../../constants/teamEnums';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useConferencesMap, allConferenceList } from '../../hooks/useConferencesMap';
import { toDarkLogo } from '../../utils/teamLogo';
import { formGridSx, primaryButtonSx } from '../../styles/controls';

const RECORD_PANELS = [
    [
        'Current season record',
        [
            ['current_wins', 'Current wins'],
            ['current_losses', 'Current losses'],
            ['current_conference_wins', 'Conference wins'],
            ['current_conference_losses', 'Conference losses'],
        ],
    ],
    [
        'Overall record',
        [
            ['overall_wins', 'Overall wins'],
            ['overall_losses', 'Overall losses'],
            ['overall_conference_wins', 'Overall conf wins'],
            ['overall_conference_losses', 'Overall conf losses'],
        ],
    ],
    [
        'Championship record',
        [
            ['conference_championship_wins', 'Conf champ wins'],
            ['conference_championship_losses', 'Conf champ losses'],
            ['bowl_wins', 'Bowl wins'],
            ['bowl_losses', 'Bowl losses'],
            ['playoff_wins', 'Playoff wins'],
            ['playoff_losses', 'Playoff losses'],
            ['national_championship_wins', 'National champ wins'],
            ['national_championship_losses', 'National champ losses'],
        ],
    ],
];

const TeamEditDialog = ({ teamId, onClose, onSaved }) => {
    useConferencesMap();
    const conferences = allConferenceList();
    const [team, setTeam] = useState(null);
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
        setTeam(null);
        getTeamById(teamId)
            .then((loadedTeam) => {
                if (scope.active) {
                    setTeam(loadedTeam);
                }
            })
            .catch(() => {
                if (scope.active) {
                    console.error('Failed to fetch team');
                    setError('Failed to load team');
                }
            })
            .finally(() => {
                if (scope.active) {
                    setLoading(false);
                }
            });
        return () => {
            scope.active = false;
        };
    }, [teamId]);

    const handleChange = (field, value) => setTeam((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        const scope = scopeRef.current;
        setSaving(true);
        setError(null);
        try {
            await updateTeam(team);
            if (scope.active) {
                onSaved();
            }
        } catch {
            if (scope.active) {
                console.error('Failed to update team');
                setError('Failed to update team');
            }
        } finally {
            if (scope.active) {
                setSaving(false);
            }
        }
    };

    const saveButton = team && (
        <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={primaryButtonSx}>
            {saving ? 'Saving...' : 'Save changes'}
        </Box>
    );

    const tabs = team && [
        {
            value: 'basics',
            label: 'Basics',
            content: (
                <Panel header="Basic information">
                    <Box sx={formGridSx}>
                        <TextInputField
                            label="Team name"
                            value={team.name}
                            onChange={(value) => handleChange('name', value)}
                        />
                        <TextInputField
                            label="Abbreviation"
                            value={team.abbreviation}
                            onChange={(value) => handleChange('abbreviation', value)}
                        />
                        <TextInputField
                            label="Short name"
                            value={team.short_name}
                            onChange={(value) => handleChange('short_name', value)}
                        />
                        <FormField label="Stadium">
                            <StadiumPicker
                                value={team.stadium || ''}
                                onChange={(value) => handleChange('stadium', value || null)}
                                allowNone
                                noneLabel="Standard stadium"
                                ariaLabel="Stadium"
                            />
                        </FormField>
                        <ColorField
                            label="Primary color"
                            value={team.primary_color}
                            onChange={(value) => handleChange('primary_color', value)}
                            placeholder="#FF0000"
                        />
                        <ColorField
                            label="Secondary color"
                            value={team.secondary_color}
                            onChange={(value) => handleChange('secondary_color', value)}
                            placeholder="#0000FF"
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: '14px',
                            p: '0 16px 16px',
                        }}
                    >
                        <LogoUrlField
                            label="Logo URL"
                            value={team.logo || ''}
                            onChange={(value) => handleChange('logo', value)}
                            uploadKind="TEAM"
                        />
                        <LogoUrlField
                            label="Dark logo URL"
                            value={team.logo_dark || ''}
                            onChange={(value) => handleChange('logo_dark', value)}
                            uploadKind="TEAM"
                            fallback={toDarkLogo(team.logo) || undefined}
                            placeholder="Automatic from logo"
                            previewBg="#0a1620"
                        />
                    </Box>
                </Panel>
            ),
        },
        {
            value: 'playbooks',
            label: 'Playbooks & conference',
            content: (
                <Panel header="Playbooks & conference">
                    <Box sx={formGridSx}>
                        <SelectField
                            label="Offensive playbook"
                            value={team.offensive_playbook}
                            onChange={(value) => handleChange('offensive_playbook', value)}
                            options={OFFENSIVE_PLAYBOOKS.map((playbook) => ({
                                value: playbook,
                                label: formatOffensivePlaybook(playbook),
                            }))}
                        />
                        <SelectField
                            label="Defensive playbook"
                            value={team.defensive_playbook}
                            onChange={(value) => handleChange('defensive_playbook', value)}
                            options={DEFENSIVE_PLAYBOOKS.map((playbook) => ({
                                value: playbook,
                                label: formatDefensivePlaybook(playbook),
                            }))}
                        />
                        <SelectField
                            label="Conference"
                            value={team.conference}
                            onChange={(value) => handleChange('conference', value)}
                            options={conferences.map((conference) => ({
                                value: conference.code,
                                label: `${conference.label}${conference.active ? '' : ' (inactive)'}`,
                            }))}
                        />
                        <SelectField
                            label="Subdivision"
                            value={team.subdivision}
                            onChange={(value) => handleChange('subdivision', value)}
                            options={SUBDIVISIONS.map((subdivision) => ({
                                value: subdivision,
                                label: subdivision,
                            }))}
                        />
                    </Box>
                </Panel>
            ),
        },
        {
            value: 'records',
            label: 'Records',
            content: (
                <>
                    {RECORD_PANELS.map(([header, fields]) => (
                        <Panel key={header} header={header}>
                            <Box sx={formGridSx}>
                                {fields.map(([key, label]) => (
                                    <NumberField
                                        key={key}
                                        label={label}
                                        value={team[key]}
                                        onChange={(value) => handleChange(key, value)}
                                    />
                                ))}
                            </Box>
                        </Panel>
                    ))}
                </>
            ),
        },
        {
            value: 'status',
            label: 'Status',
            content: (
                <Panel header="Status">
                    <Box sx={{ display: 'flex', gap: '32px', p: '16px', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Toggle on={!!team.is_taken} onClick={() => handleChange('is_taken', !team.is_taken)} />
                            <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Team is taken</Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Toggle on={!!team.active} onClick={() => handleChange('active', !team.active)} />
                            <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Team is active</Box>
                        </Box>
                    </Box>
                </Panel>
            ),
        },
    ];

    return (
        <EditDialog
            open
            onClose={onClose}
            title={team ? <TeamName name={team.name} size={24} label={`Edit team: ${team.name}`} /> : 'Edit team'}
            actions={saveButton}
            tabs={!loading && tabs ? tabs : undefined}
        >
            {error && <Alert severity="error">{error}</Alert>}
            {loading && (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && !team && !error && <Alert severity="error">Team not found</Alert>}
        </EditDialog>
    );
};

TeamEditDialog.propTypes = {
    teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onClose: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
};

export default TeamEditDialog;
