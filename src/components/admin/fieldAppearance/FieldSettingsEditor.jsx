import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import Toggle from '../../ui/Toggle';
import LogoUrlField from '../LogoUrlField';
import { formFrom, payloadFrom } from './fieldDefinitions';
import { renderPostseasonPreview } from '../../../api/fieldAppearanceApi';

const PREVIEW_DEBOUNCE_MS = 450;

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const clearSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const helpSx = { color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' };

const ColorControl = ({ value, onChange, clearable }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box
            component="input"
            type="color"
            value={value || '#000000'}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            sx={{ width: 42, height: 38, p: '2px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', cursor: 'pointer', opacity: value ? 1 : 0.35 }}
        />
        <Box component="input" value={value} onChange={(event) => onChange(event.target.value)} placeholder={clearable ? 'Not set' : '#RRGGBB'} sx={inputSx} />
        {clearable && value && (
            <Box component="button" type="button" onClick={() => onChange('')} sx={clearSx}>Clear</Box>
        )}
    </Box>
);

ColorControl.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    clearable: PropTypes.bool,
};

const FieldControl = ({ definition, value, onChange }) => {
    switch (definition.type) {
        case 'color':
            return <ColorControl value={value} onChange={onChange} />;
        case 'optionalColor':
            return <ColorControl value={value} onChange={onChange} clearable />;
        case 'select':
            return (
                <Box component="select" value={value} onChange={(event) => onChange(event.target.value)} sx={inputSx}>
                    {definition.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Box>
            );
        case 'toggle':
            return <Toggle on={value} onClick={() => onChange(!value)} />;
        case 'logo':
            return <LogoUrlField label="" value={value} onChange={(event) => onChange(event.target.value)} />;
        default:
            return <Box component="input" value={value} onChange={(event) => onChange(event.target.value)} placeholder={definition.placeholder} sx={inputSx} />;
    }
};

FieldControl.propTypes = {
    definition: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    onChange: PropTypes.func.isRequired,
};

const FieldSettingsEditor = ({ title, sections, source, onSave, preview }) => {
    const [form, setForm] = useState(() => formFrom(sections, source));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(!!preview);
    const [previewError, setPreviewError] = useState(null);
    const previewUrlRef = useRef(null);

    useEffect(() => {
        setForm(formFrom(sections, source));
        setError(null);
        setSaved(false);
    }, [sections, source]);

    useEffect(() => {
        if (!preview) return undefined;
        let cancelled = false;
        setPreviewLoading(true);
        const half = preview.category === 'BOWL' ? 'bowl' : 'postseason';
        const timer = setTimeout(async () => {
            try {
                const url = await renderPostseasonPreview({ category: preview.category, key: preview.key, [half]: payloadFrom(sections, form) });
                if (cancelled) { URL.revokeObjectURL(url); return; }
                if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = url;
                setPreviewUrl(url);
                setPreviewError(null);
            } catch (err) {
                if (!cancelled) setPreviewError(err.message || 'No past game to preview');
            } finally {
                if (!cancelled) setPreviewLoading(false);
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [preview, sections, form]);

    useEffect(() => () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); }, []);

    const change = (key, value) => {
        setSaved(false);
        setForm((current) => ({ ...current, [key]: value }));
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

    const editor = (
        <Panel header={title}>
            <Box component="form" onSubmit={submit} sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && <Alert severity="error">{error}</Alert>}
                {saved && <Alert severity="success">Saved</Alert>}
                {sections.map((section) => (
                    <Box key={section.title}>
                        <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', mb: '10px' }}>{section.title}</Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                            {section.fields.map((definition) => (
                                <Box key={definition.key}>
                                    <Box sx={labelSx}>{definition.label}</Box>
                                    <FieldControl definition={definition} value={form[definition.key]} onChange={(value) => change(definition.key, value)} />
                                    {definition.help && <Box sx={helpSx}>{definition.help}</Box>}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}
                <Box component="button" type="submit" disabled={saving} sx={{ ...btnSx, justifySelf: 'start', alignSelf: 'flex-start' }}>
                    {saving ? 'Saving...' : 'Save'}
                </Box>
            </Box>
        </Panel>
    );

    if (!preview) return editor;

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: '16px', alignItems: 'start' }}>
            {editor}
            <Panel header="Field preview" sx={{ position: { md: 'sticky' }, top: { md: '16px' } }}>
                <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minHeight: 160 }}>
                    {previewError && <Alert severity="warning" sx={{ width: '100%' }}>{previewError}</Alert>}
                    <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {previewUrl && <Box component="img" src={previewUrl} alt="Field preview" sx={{ maxWidth: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', opacity: previewLoading ? 0.5 : 1, transition: 'opacity 0.15s' }} />}
                        {previewLoading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={26} /></Box>}
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center' }}>Shows the last-played matchup for this field.</Box>
                </Box>
            </Panel>
        </Box>
    );
};

FieldSettingsEditor.propTypes = {
    title: PropTypes.node.isRequired,
    sections: PropTypes.array.isRequired,
    source: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    preview: PropTypes.shape({ category: PropTypes.string, key: PropTypes.string }),
};

export default FieldSettingsEditor;
