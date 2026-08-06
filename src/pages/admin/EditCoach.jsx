import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import { getAllUsers, updateUser } from '../../api/userApi';
import { getAllTeams } from '../../api/teamApi';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatRole, formatPosition } from '../../utils/formatText';
import { slugId } from '../../utils/a11y';
import { goBackOr } from '../../utils/navigation';

const ROLES = ['USER', 'CONFERENCE_COMMISSIONER', 'ADMIN'];
const POSITIONS = ['HEAD_COACH', 'OFFENSIVE_COORDINATOR', 'DEFENSIVE_COORDINATOR', 'RETIRED'];

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.85rem' };
const selectSx = { ...inputSx, cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const btnGhostSx = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const backSx = { color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', mb: '14px' };
const gridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 16px', p: '16px' };

const Field = ({ label, children }) => {
    const id = slugId(label);
    return (
        <Box sx={{ mb: '14px' }}>
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

const EditCoach = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allUsers, allTeams] = await Promise.all([getAllUsers(), getAllTeams().catch(() => [])]);
                const decoded = decodeURIComponent(username || '');
                const found = allUsers.find((entry) => entry.username === decoded || entry.coach_name === decoded);
                setUser(found || null);
                setTeams(allTeams.filter((team) => team.active).map((team) => team.name).sort((a, b) => a.localeCompare(b)));
                if (!found) setError('Coach not found');
            } catch (err) {
                console.error('Failed to load coach:', err);
                setError('Failed to load coach');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    const handleChange = (field, value) => setUser((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateUser(user);
            setSuccess(true);
            setTimeout(() => navigate('/admin/team-management'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to update coach');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Edit Coach">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout title="Edit Coach">
                <Alert severity="error">{error || 'Coach not found'}</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Edit Coach: ${user.coach_name || user.username}`}>
            <Box component="button" type="button" onClick={() => goBackOr(navigate, '/admin/team-management')} sx={{ ...backSx, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', p: 0 }}>&larr; Team management</Box>

            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: '16px' }}>Coach updated successfully. Redirecting...</Alert>}

            <Panel header="Basic information" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <Field label="Coach name">
                        <Box component="input" value={user.coach_name || ''} onChange={(e) => handleChange('coach_name', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Discord tag">
                        <Box component="input" value={user.discord_tag || ''} onChange={(e) => handleChange('discord_tag', e.target.value)} sx={inputSx} />
                    </Field>
                    <Field label="Role">
                        <Box component="select" value={user.role || ''} onChange={(e) => handleChange('role', e.target.value)} sx={selectSx}>
                            {ROLES.map((role) => <option key={role} value={role}>{formatRole(role)}</option>)}
                        </Box>
                    </Field>
                    <Field label="Position">
                        <Box component="select" value={user.position || ''} onChange={(e) => handleChange('position', e.target.value)} sx={selectSx}>
                            {POSITIONS.map((position) => <option key={position} value={position}>{formatPosition(position)}</option>)}
                        </Box>
                    </Field>
                    <Field label="Team">
                        <Box component="select" value={user.team || ''} onChange={(e) => handleChange('team', e.target.value || null)} sx={selectSx}>
                            <option value="">None (free agent)</option>
                            {teams.map((team) => <option key={team} value={team}>{team}</option>)}
                        </Box>
                    </Field>
                </Box>
            </Panel>

            <Panel header="Playbooks" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <Field label="Offensive playbook">
                        <Box component="select" value={user.offensive_playbook || ''} onChange={(e) => handleChange('offensive_playbook', e.target.value)} sx={selectSx}>
                            {OFFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{formatOffensivePlaybook(playbook)}</option>)}
                        </Box>
                    </Field>
                    <Field label="Defensive playbook">
                        <Box component="select" value={user.defensive_playbook || ''} onChange={(e) => handleChange('defensive_playbook', e.target.value)} sx={selectSx}>
                            {DEFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{formatDefensivePlaybook(playbook)}</option>)}
                        </Box>
                    </Field>
                </Box>
            </Panel>

            <Panel header="Record" sx={{ mb: '16px' }}>
                <Box sx={gridSx}>
                    <NumberField label="Wins" value={user.wins} onChange={(v) => handleChange('wins', v)} />
                    <NumberField label="Losses" value={user.losses} onChange={(v) => handleChange('losses', v)} />
                    <NumberField label="Conference wins" value={user.conference_wins} onChange={(v) => handleChange('conference_wins', v)} />
                    <NumberField label="Conference losses" value={user.conference_losses} onChange={(v) => handleChange('conference_losses', v)} />
                    <NumberField label="Conf champ wins" value={user.conference_championship_wins} onChange={(v) => handleChange('conference_championship_wins', v)} />
                    <NumberField label="Conf champ losses" value={user.conference_championship_losses} onChange={(v) => handleChange('conference_championship_losses', v)} />
                    <NumberField label="Bowl wins" value={user.bowl_wins} onChange={(v) => handleChange('bowl_wins', v)} />
                    <NumberField label="Bowl losses" value={user.bowl_losses} onChange={(v) => handleChange('bowl_losses', v)} />
                    <NumberField label="Playoff wins" value={user.playoff_wins} onChange={(v) => handleChange('playoff_wins', v)} />
                    <NumberField label="Playoff losses" value={user.playoff_losses} onChange={(v) => handleChange('playoff_losses', v)} />
                    <NumberField label="National champ wins" value={user.national_championship_wins} onChange={(v) => handleChange('national_championship_wins', v)} />
                    <NumberField label="National champ losses" value={user.national_championship_losses} onChange={(v) => handleChange('national_championship_losses', v)} />
                </Box>
            </Panel>

            <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Box component="button" type="button" onClick={() => goBackOr(navigate, '/admin/team-management')} sx={btnGhostSx}>Cancel</Box>
                <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={btnPrimarySx}>{saving ? 'Saving...' : 'Save changes'}</Box>
            </Box>
        </AdminLayout>
    );
};

export default EditCoach;
