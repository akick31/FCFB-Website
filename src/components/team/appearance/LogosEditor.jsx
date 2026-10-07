import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import LogoUrlField from '../../admin/LogoUrlField';
import { useAppearancePreview } from './useAppearancePreview';

const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const PreviewPanel = ({ title, state, bg }) => (
    <Panel header={title}>
        <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minHeight: 150 }}>
            {state.error && <Alert severity="warning" sx={{ width: '100%' }}>{state.error}</Alert>}
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', background: bg, borderRadius: 'var(--r-sm)' }}>
                {state.url && <Box component="img" src={state.url} alt={title} sx={{ maxWidth: '100%', opacity: state.loading ? 0.5 : 1, transition: 'opacity 0.15s' }} />}
                {state.loading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={26} /></Box>}
            </Box>
        </Box>
    </Panel>
);

PreviewPanel.propTypes = { title: PropTypes.string.isRequired, state: PropTypes.object.isRequired, bg: PropTypes.string };

const LogosEditor = ({ team, source, canEdit, onSave, onDirtyChange }) => {
    const [form, setForm] = useState({ logo: source.logo || '', logoDark: source.logo_dark || '', secondaryLogo: source.secondary_logo || '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm({ logo: source.logo || '', logoDark: source.logo_dark || '', secondaryLogo: source.secondary_logo || '' });
        onDirtyChange?.(false);
    }, [source]);

    const previewBody = useMemo(() => ({ logo: form.logo, logo_dark: form.logoDark, secondary_logo: form.secondaryLogo }), [form]);
    const uniform = useAppearancePreview(team, 'UNIFORM', previewBody);
    const fieldPreview = useAppearancePreview(team, 'FIELD', previewBody);

    const change = (key, value) => { setSaved(false); onDirtyChange?.(true); setForm((current) => ({ ...current, [key]: value })); };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            await onSave({ logo: form.logo || null, logo_dark: form.logoDark || null, secondary_logo: form.secondaryLogo || null });
            setSaved(true);
            onDirtyChange?.(false);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: '16px', alignItems: 'start' }}>
            <Panel header="Team logos">
                <Box component="form" onSubmit={submit} sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {saved && <Alert severity="success">Saved</Alert>}
                    {!canEdit && <Alert severity="info">Logos are league identity and only admins or commissioners can change them.</Alert>}
                    <Box sx={{ opacity: canEdit ? 1 : 0.6, pointerEvents: canEdit ? 'auto' : 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <LogoUrlField label="Primary logo" value={form.logo} onChange={(e) => change('logo', e.target.value)} previewBg="#ffffff" />
                        <LogoUrlField label="Primary logo (dark backgrounds)" value={form.logoDark} onChange={(e) => change('logoDark', e.target.value)} previewBg="#0a1620" />
                        <LogoUrlField label="Secondary logo" value={form.secondaryLogo} onChange={(e) => change('secondaryLogo', e.target.value)} previewBg="#ffffff" />
                    </Box>
                    {canEdit && (
                        <Box component="button" type="submit" disabled={saving} sx={{ ...btnSx, alignSelf: 'flex-start' }}>
                            {saving ? 'Saving...' : 'Save logos'}
                        </Box>
                    )}
                </Box>
            </Panel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', position: { md: 'sticky' }, top: { md: '16px' } }}>
                <PreviewPanel title="Uniform preview" state={uniform} />
                <PreviewPanel title="Field preview" state={fieldPreview} />
            </Box>
        </Box>
    );
};

LogosEditor.propTypes = {
    team: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onDirtyChange: PropTypes.func,
};

export default LogosEditor;
