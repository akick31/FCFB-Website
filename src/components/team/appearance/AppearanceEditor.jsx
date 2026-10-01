import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import AppearanceControl from './AppearanceControl';
import { formFrom, payloadFrom } from './appearanceSections';
import { renderAppearancePreview } from '../../../api/teamAppearanceApi';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const helpSx = { color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const PREVIEW_DEBOUNCE_MS = 450;

const AppearanceEditor = ({ team, view, half, sections, source, canEdit, onSave, teamColors, wallTextDefault }) => {
    const [form, setForm] = useState(() => formFrom(sections, source, teamColors));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [previewError, setPreviewError] = useState(null);
    const previewUrlRef = useRef(null);

    useEffect(() => {
        setForm(formFrom(sections, source, teamColors));
        setError(null);
        setSaved(false);
    }, [sections, source, teamColors]);

    useEffect(() => {
        let cancelled = false;
        setPreviewLoading(true);
        const timer = setTimeout(async () => {
            try {
                const url = await renderAppearancePreview({ team, view, [half]: payloadFrom(sections, form) });
                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }
                if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = url;
                setPreviewUrl(url);
                setPreviewError(null);
            } catch (err) {
                if (!cancelled) setPreviewError(err.message || 'Preview unavailable');
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [team, view, half, sections, form]);

    useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); }, []);

    const change = (key, value) => {
        setSaved(false);
        setForm((current) => {
            const next = { ...current, [key]: value };
            const showsText = value === 'TEXT_ONLY' || value === 'TEXT_WITH_LOGOS';
            if (key === 'wall_design' && showsText && !current.wall_text && wallTextDefault) {
                next.wall_text = wallTextDefault;
            }
            return next;
        });
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            await onSave(payloadFrom(sections, form));
            setSaved(true);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: '16px', alignItems: 'start' }}>
            <Panel header={canEdit ? 'Settings' : 'Settings (view only)'}>
                <Box component="form" onSubmit={submit} sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {saved && <Alert severity="success">Saved</Alert>}
                    {sections.map((section) => (
                        <Box key={section.title}>
                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', mb: '10px' }}>{section.title}</Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                                {section.fields.map((definition) => (
                                    <Box key={definition.key}>
                                        <Box sx={labelSx}>{definition.label}</Box>
                                        <AppearanceControl definition={definition} value={form[definition.key]} onChange={(value) => change(definition.key, value)} disabled={!canEdit} teamColors={teamColors} />
                                        {definition.help && <Box sx={helpSx}>{definition.help}</Box>}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                    {canEdit && (
                        <Box component="button" type="submit" disabled={saving} sx={{ ...btnSx, alignSelf: 'flex-start' }}>
                            {saving ? 'Saving...' : 'Save'}
                        </Box>
                    )}
                </Box>
            </Panel>
            <Panel header="Live preview" sx={{ position: { md: 'sticky' }, top: { md: '16px' } }}>
                <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minHeight: 200 }}>
                    {previewError && <Alert severity="warning" sx={{ width: '100%' }}>{previewError}</Alert>}
                    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {previewUrl && <Box component="img" src={previewUrl} alt="Appearance preview" sx={{ maxWidth: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', opacity: previewLoading ? 0.5 : 1, transition: 'opacity 0.15s' }} />}
                        {previewLoading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={28} /></Box>}
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center' }}>Unsaved edits shown here. Save to apply.</Box>
                </Box>
            </Panel>
        </Box>
    );
};

AppearanceEditor.propTypes = {
    team: PropTypes.string.isRequired,
    view: PropTypes.oneOf(['FIELD', 'HELMET']).isRequired,
    half: PropTypes.oneOf(['uniform', 'field']).isRequired,
    sections: PropTypes.array.isRequired,
    source: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    teamColors: PropTypes.object,
    wallTextDefault: PropTypes.string,
};

export default AppearanceEditor;
