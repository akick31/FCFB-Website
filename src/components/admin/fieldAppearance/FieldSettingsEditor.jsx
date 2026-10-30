import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import EditorShell from '../../appearance/editor/EditorShell';
import SettingsPanel from '../../appearance/editor/SettingsPanel';
import Toggle from '../../ui/Toggle';
import ScaleControl from '../../appearance/editor/ScaleControl';
import LogoUrlField from '../LogoUrlField';
import FontControl from '../../team/appearance/FontControl';
import { formFrom, payloadFrom } from './fieldDefinitions';
import { renderPostseasonPreview } from '../../../api/fieldAppearanceApi';
import { useAppearanceDraft } from '../../../hooks/useAppearanceDraft';
import { inputSx } from '../../../styles/controls';

const PREVIEW_DEBOUNCE_MS = 450;

const clearSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
};

const ColorControl = ({ value, onChange, clearable }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box
            component="input"
            type="color"
            value={value || '#000000'}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            sx={{
                width: 42,
                height: 38,
                p: '2px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--surface-2)',
                cursor: 'pointer',
                opacity: value ? 1 : 0.35,
            }}
        />
        <Box
            component="input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={clearable ? 'Not set' : '#RRGGBB'}
            sx={inputSx}
        />
        {clearable && value && (
            <Box component="button" type="button" onClick={() => onChange('')} sx={clearSx}>
                Clear
            </Box>
        )}
    </Box>
);

ColorControl.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    clearable: PropTypes.bool,
};

const FieldControl = ({ definition, value, onChange, eventLogo }) => {
    switch (definition.type) {
        case 'color':
            return <ColorControl value={value} onChange={onChange} />;
        case 'optionalColor':
            return <ColorControl value={value} onChange={onChange} clearable />;
        case 'select':
        case 'mode':
            return (
                <Box component="select" value={value} onChange={(event) => onChange(event.target.value)} sx={inputSx}>
                    {definition.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Box>
            );
        case 'colorToken': {
            const tokens = ['PRIMARY', 'SECONDARY', 'TERTIARY', 'WHITE', 'BLACK'];
            const resolved = value === 'HOME' || value === 'AWAY' ? 'PRIMARY' : value;
            const mode = resolved === '' ? 'NONE' : tokens.includes(resolved) ? resolved : 'CUSTOM';
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Box
                        component="select"
                        value={mode}
                        onChange={(event) => {
                            const next = event.target.value;
                            if (next === 'CUSTOM') {
                                onChange('#000000');
                            } else if (next === 'NONE') {
                                onChange('');
                            } else {
                                onChange(next);
                            }
                        }}
                        sx={inputSx}
                    >
                        <option value="NONE">Not set</option>
                        <option value="PRIMARY">Primary</option>
                        <option value="SECONDARY">Secondary</option>
                        <option value="TERTIARY">Tertiary</option>
                        <option value="WHITE">White</option>
                        <option value="BLACK">Black</option>
                        <option value="CUSTOM">Custom hex...</option>
                    </Box>
                    {mode === 'CUSTOM' && <ColorControl value={value} onChange={onChange} clearable />}
                </Box>
            );
        }
        case 'scale':
            return <ScaleControl definition={definition} value={Number(value)} onChange={onChange} />;
        case 'toggle':
            return <Toggle on={value} onClick={() => onChange(!value)} />;
        case 'logo':
            return (
                <LogoUrlField
                    label=""
                    value={value}
                    onChange={onChange}
                    uploadKind="POSTSEASON"
                    fallback={definition.eventLogoFallback ? eventLogo : undefined}
                    placeholder={definition.eventLogoFallback ? 'Built-in logo' : undefined}
                />
            );
        case 'font':
            return <FontControl value={value} onChange={onChange} allowDefault={definition.allowDefault} />;
        default:
            return (
                <Box
                    component="input"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={definition.placeholder}
                    sx={inputSx}
                />
            );
    }
};

FieldControl.propTypes = {
    definition: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    onChange: PropTypes.func.isRequired,
    eventLogo: PropTypes.string,
};

const FieldSettingsEditor = ({ sections, source, onSave, preview, aside, eventLogo }) => {
    const sourceForm = useMemo(() => formFrom(sections, source), [sections, source]);
    const { form, changeForm, saving, error, saved, save } = useAppearanceDraft(sourceForm);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(!!preview);
    const [previewError, setPreviewError] = useState(null);
    const previewUrlRef = useRef(null);

    useEffect(() => {
        if (!preview) {
            return undefined;
        }
        let cancelled = false;
        setPreviewLoading(true);
        const half = preview.category === 'BOWL' ? 'bowl' : 'postseason';
        const timer = setTimeout(async () => {
            try {
                const url = await renderPostseasonPreview({
                    category: preview.category,
                    key: preview.key,
                    [half]: payloadFrom(sections, form),
                });
                if (cancelled) {
                    URL.revokeObjectURL(url);
                    return;
                }
                if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                }
                previewUrlRef.current = url;
                setPreviewUrl(url);
                setPreviewError(null);
            } catch (err) {
                if (!cancelled) {
                    setPreviewError(err.message || 'No past game to preview');
                }
            } finally {
                if (!cancelled) {
                    setPreviewLoading(false);
                }
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [preview, sections, form]);

    useEffect(
        () => () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        },
        []
    );

    const change = (key, value) => {
        changeForm((current) => {
            const next = { ...current, [key]: value };
            const definition = sections.flatMap((section) => section.fields).find((field) => field.key === key);
            if (definition?.type === 'mode' && value === 'DIFFERENT' && definition.perSide) {
                definition.perSide.forEach((perSideKey) => {
                    if (!next[perSideKey]) {
                        next[perSideKey] = 'PRIMARY';
                    }
                });
            }
            return next;
        });
    };

    const submit = async (event) => {
        event.preventDefault();
        await save(async (draft) => formFrom(sections, await onSave(payloadFrom(sections, draft))));
    };

    const renderControl = (definition) => (
        <FieldControl
            definition={definition}
            value={form[definition.key]}
            onChange={(value) => change(definition.key, value)}
            eventLogo={eventLogo}
        />
    );

    const fieldPreview = preview && (
        <Panel header="Field preview">
            <Box
                sx={{
                    p: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: 140,
                }}
            >
                {previewError && (
                    <Alert severity="warning" sx={{ width: '100%' }}>
                        {previewError}
                    </Alert>
                )}
                <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {previewUrl && (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt="Field preview"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: { xs: '34vh', md: 'calc(100vh - 280px)' },
                                borderRadius: 'var(--r-sm)',
                                border: '1px solid var(--line)',
                                opacity: previewLoading ? 0.5 : 1,
                                transition: 'opacity 0.15s',
                            }}
                        />
                    )}
                    {previewLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress size={26} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Panel>
    );

    return (
        <Box component="form" onSubmit={submit}>
            <EditorShell
                previewWidth={340}
                preview={
                    fieldPreview && (
                        <>
                            {fieldPreview}
                            {aside}
                        </>
                    )
                }
                settings={
                    <SettingsPanel
                        sections={sections}
                        form={form}
                        renderControl={renderControl}
                        canEdit
                        saving={saving}
                        saved={saved}
                        error={error}
                    />
                }
            />
        </Box>
    );
};

FieldSettingsEditor.propTypes = {
    sections: PropTypes.array.isRequired,
    source: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    preview: PropTypes.shape({ category: PropTypes.string, key: PropTypes.string }),
    aside: PropTypes.node,
    eventLogo: PropTypes.string,
};

export default FieldSettingsEditor;
