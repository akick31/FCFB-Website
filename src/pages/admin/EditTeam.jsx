import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import Toggle from '../../components/ui/Toggle';
import { getTeamById, updateTeam } from '../../api/teamApi';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS, SUBDIVISIONS } from '../../constants/teamEnums';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useConferencesMap, allConferenceList } from '../../components/constants/conferences';
import { slugId } from '../../utils/a11y';
import { goBackOr } from '../../utils/navigation';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.85rem' };
const selectSx = { ...inputSx, cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const fieldWrapSx = { mb: '14px' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const btnGhostSx = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const backSx = { color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', mb: '14px' };

const Field = ({ label, children }) => {
    const id = slugId(label);
    return (
        <Box sx={fieldWrapSx}>
            <Box component="label" htmlFor={id} sx={labelSx}>{label}</Box>
            {React.cloneElement(children, { id })}
        </Box>
    );
};

Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

const NumberField = ({ label, value, onChange }) => (
    <Field label={label}>
        <Box component="input" type="number" value={value ?? 0} onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)} sx={inputSx} />
    </Field>
);

NumberField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number, onChange: PropTypes.func.isRequired };

const gridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 16px', p: '16px' };

const EditTeam = () => {
    useConferencesMap();
    const conferences = allConferenceList();
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!teamId) return;
        getTeamById(teamId)
            .then(setTeam)
            .catch((err) => { console.error('Failed to fetch team:', err); setError('Failed to load team'); })
            .finally(() => setLoading(false));
    }, [teamId]);

    const handleChange = (field, value) => setTeam((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateTeam(team);
            setSuccess(true);
            setTimeout(() => navigate('/admin/team-management'), 1500);
        } catch (err) {
            console.error('Failed to update team:', err);
            setError('Failed to update team');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Edit Team">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    if (!team) {
        return (
            <AdminLayout title="Edit Team">
                <Alert severity="error">Team not found</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Edit Team: ${team.name}`}>
            <Box component="button" type="button" onClick={() => goBackOr(navigate, '/admin/team-management')} sx={{ ...backSx, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', p: 0 }}>&larr; Team management</Box>

            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: '16px' }}>Team updated successfully. Redirecting...</Alert>}

            <Panel header="Basic information" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <Field label="Team name">
                        <Box component="input" value={team.name || ''} onChange={(e) => handleChange('name', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Abbreviation">
                        <Box component="input" value={team.abbreviation || ''} onChange={(e) => handleChange('abbreviation', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Short name">
                        <Box component="input" value={team.short_name || ''} onChange={(e) => handleChange('short_name', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Stadium">
                        <Box component="input" value={team.stadium || ''} onChange={(e) => handleChange('stadium', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Logo URL">
                        <Box component="input" value={team.logo || ''} onChange={(e) => handleChange('logo', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Dark logo URL">
                        <Box component="input" value={team.logo_dark || ''} onChange={(e) => handleChange('logo_dark', e.target.value)} sx={inputSx} />
                    </Field>
                    <Box sx={fieldWrapSx}>
                        <Box component="label" htmlFor="primary-color" sx={labelSx}>Primary color</Box>
                        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: team.primary_color || 'transparent' }} />
                            <Box component="input" id="primary-color" value={team.primary_color || ''} onChange={(e) => handleChange('primary_color', e.target.value)} placeholder="#FF0000" sx={inputSx} />
                        </Box>
                    </Box>
                    <Box sx={fieldWrapSx}>
                        <Box component="label" htmlFor="secondary-color" sx={labelSx}>Secondary color</Box>
                        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: team.secondary_color || 'transparent' }} />
                            <Box component="input" id="secondary-color" value={team.secondary_color || ''} onChange={(e) => handleChange('secondary_color', e.target.value)} placeholder="#0000FF" sx={inputSx} />
                        </Box>
                    </Box>
                </Box>
            </Panel>

            <Panel header="Playbooks & conference" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <Field label="Offensive playbook">
                        <Box component="select" value={team.offensive_playbook || ''} onChange={(e) => handleChange('offensive_playbook', e.target.value)} sx={selectSx}>
                            {OFFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{formatOffensivePlaybook(playbook)}</option>)}
                        </Box>
                    </Field>
                    <Field label="Defensive playbook">
                        <Box component="select" value={team.defensive_playbook || ''} onChange={(e) => handleChange('defensive_playbook', e.target.value)} sx={selectSx}>
                            {DEFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{formatDefensivePlaybook(playbook)}</option>)}
                        </Box>
                    </Field>
                    <Field label="Conference">
                        <Box component="select" value={team.conference || ''} onChange={(e) => handleChange('conference', e.target.value)} sx={selectSx}>
                            {conferences.map((conference) => (
                                <option key={conference.code} value={conference.code}>{conference.label}{!conference.active ? ' (inactive)' : ''}</option>
                            ))}
                        </Box>
                    </Field>
                    <Field label="Subdivision">
                        <Box component="select" value={team.subdivision || ''} onChange={(e) => handleChange('subdivision', e.target.value)} sx={selectSx}>
                            {SUBDIVISIONS.map((subdivision) => <option key={subdivision} value={subdivision}>{subdivision}</option>)}
                        </Box>
                    </Field>
                </Box>
            </Panel>

            <Panel header="Current season record" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <NumberField label="Current wins" value={team.current_wins} onChange={(v) => handleChange('current_wins', v)} />
                    <NumberField label="Current losses" value={team.current_losses} onChange={(v) => handleChange('current_losses', v)} />
                    <NumberField label="Conference wins" value={team.current_conference_wins} onChange={(v) => handleChange('current_conference_wins', v)} />
                    <NumberField label="Conference losses" value={team.current_conference_losses} onChange={(v) => handleChange('current_conference_losses', v)} />
                </Box>
            </Panel>

            <Panel header="Overall record" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <NumberField label="Overall wins" value={team.overall_wins} onChange={(v) => handleChange('overall_wins', v)} />
                    <NumberField label="Overall losses" value={team.overall_losses} onChange={(v) => handleChange('overall_losses', v)} />
                    <NumberField label="Overall conf wins" value={team.overall_conference_wins} onChange={(v) => handleChange('overall_conference_wins', v)} />
                    <NumberField label="Overall conf losses" value={team.overall_conference_losses} onChange={(v) => handleChange('overall_conference_losses', v)} />
                </Box>
            </Panel>

            <Panel header="Championship record" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <NumberField label="Conf champ wins" value={team.conference_championship_wins} onChange={(v) => handleChange('conference_championship_wins', v)} />
                    <NumberField label="Conf champ losses" value={team.conference_championship_losses} onChange={(v) => handleChange('conference_championship_losses', v)} />
                    <NumberField label="Bowl wins" value={team.bowl_wins} onChange={(v) => handleChange('bowl_wins', v)} />
                    <NumberField label="Bowl losses" value={team.bowl_losses} onChange={(v) => handleChange('bowl_losses', v)} />
                    <NumberField label="Playoff wins" value={team.playoff_wins} onChange={(v) => handleChange('playoff_wins', v)} />
                    <NumberField label="Playoff losses" value={team.playoff_losses} onChange={(v) => handleChange('playoff_losses', v)} />
                    <NumberField label="National champ wins" value={team.national_championship_wins} onChange={(v) => handleChange('national_championship_wins', v)} />
                    <NumberField label="National champ losses" value={team.national_championship_losses} onChange={(v) => handleChange('national_championship_losses', v)} />
                </Box>
            </Panel>

            <Panel header="Status" sx={{ mb: '16px' }}>
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

            <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Box component="button" type="button" onClick={() => goBackOr(navigate, '/admin/team-management')} sx={btnGhostSx}>Cancel</Box>
                <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={btnPrimarySx}>{saving ? 'Saving...' : 'Save changes'}</Box>
            </Box>
        </AdminLayout>
    );
};

export default EditTeam;
