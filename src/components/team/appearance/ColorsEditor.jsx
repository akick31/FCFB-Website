import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import { renderAppearancePreview } from '../../../api/teamAppearanceApi';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const helpSx = { color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' };

const PREVIEW_DEBOUNCE_MS = 450;

const ColorRow = ({ label, value, onChange, disabled, help }) => (
    <Box>
        <Box sx={labelSx}>{label}</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box component="input" type="color" disabled={disabled} value={value || '#000000'} onChange={(event) => onChange(event.target.value.toUpperCase())} sx={{ width: 42, height: 38, p: '2px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', cursor: disabled ? 'default' : 'pointer' }} />
            <Box component="input" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder="#RRGGBB" sx={inputSx} />
        </Box>
        {help && <Box sx={helpSx}>{help}</Box>}
    </Box>
);

ColorRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired, disabled: PropTypes.bool, help: PropTypes.string };

const usePreview = (team, view, draft) => {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const urlRef = useRef(null);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const loaded = await renderAppearancePreview({ team, view, colors: draft });
                if (cancelled) { URL.revokeObjectURL(loaded); return; }
                if (urlRef.current) URL.revokeObjectURL(urlRef.current);
                urlRef.current = loaded;
                setUrl(loaded);
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Preview unavailable');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [team, view, draft]);
    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
    return { url, loading, error };
};

const PreviewPanel = ({ title, state }) => (
    <Panel header={title}>
        <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minHeight: 160 }}>
            {state.error && <Alert severity="warning" sx={{ width: '100%' }}>{state.error}</Alert>}
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {state.url && <Box component="img" src={state.url} alt={title} sx={{ maxWidth: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', opacity: state.loading ? 0.5 : 1, transition: 'opacity 0.15s' }} />}
                {state.loading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={26} /></Box>}
            </Box>
        </Box>
    </Panel>
);

PreviewPanel.propTypes = { title: PropTypes.string.isRequired, state: PropTypes.object.isRequired };

const ColorsEditor = ({ team, source, isAdmin, canEditTertiary, onSave }) => {
    const [form, setForm] = useState({
        primary_color: source.primary_color || '#000000',
        secondary_color: source.secondary_color || '#000000',
        tertiary_color: source.tertiary_color || '#000000',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm({
            primary_color: source.primary_color || '#000000',
            secondary_color: source.secondary_color || '#000000',
            tertiary_color: source.tertiary_color || '#000000',
        });
    }, [source]);

    const scorebug = usePreview(team, 'SCOREBUG', form);
    const uniform = usePreview(team, 'UNIFORM', form);

    const change = (key, value) => { setSaved(false); setForm((current) => ({ ...current, [key]: value })); };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const payload = {};
            if (isAdmin) { payload.primaryColor = form.primary_color; payload.secondaryColor = form.secondary_color; }
            if (canEditTertiary) payload.tertiaryColor = form.tertiary_color;
            await onSave(payload);
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: '16px', alignItems: 'start' }}>
            <Panel header="Team colors">
                <Box component="form" onSubmit={submit} sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {saved && <Alert severity="success">Saved</Alert>}
                    {!isAdmin && <Alert severity="info">Primary and secondary are league identity and only admins or commissioners can change them. You can set your tertiary color.</Alert>}
                    <ColorRow label="Primary" value={form.primary_color} onChange={(value) => change('primary_color', value)} disabled={!isAdmin} />
                    <ColorRow label="Secondary" value={form.secondary_color} onChange={(value) => change('secondary_color', value)} disabled={!isAdmin} />
                    <ColorRow label="Tertiary" value={form.tertiary_color} onChange={(value) => change('tertiary_color', value)} disabled={!canEditTertiary} help="Your accent color." />
                    {(isAdmin || canEditTertiary) && (
                        <Box component="button" type="submit" disabled={saving} sx={{ ...btnSx, alignSelf: 'flex-start' }}>
                            {saving ? 'Saving...' : 'Save colors'}
                        </Box>
                    )}
                </Box>
            </Panel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', position: { md: 'sticky' }, top: { md: '16px' } }}>
                <PreviewPanel title="Scorebug preview" state={scorebug} />
                <PreviewPanel title="Uniform preview" state={uniform} />
            </Box>
        </Box>
    );
};

ColorsEditor.propTypes = {
    team: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    canEditTertiary: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default ColorsEditor;
