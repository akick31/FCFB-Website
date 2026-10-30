import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import { useAppearancePreview } from './useAppearancePreview';
import { useAppearanceDraft } from '../../../hooks/useAppearanceDraft';
import { inputSx, labelSx, primaryButtonSx } from '../../../styles/controls';

const toolbarSx = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    p: '8px 14px',
    borderBottom: '1px solid var(--line)',
};
const toolbarTitleSx = { fontWeight: 800, fontSize: '0.9rem' };

const ColorRow = ({ label, value, onChange, disabled }) => (
    <Box>
        <Box sx={labelSx}>{label}</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box
                component="input"
                type="color"
                disabled={disabled}
                value={value || '#000000'}
                onChange={(event) => onChange(event.target.value.toUpperCase())}
                sx={{
                    width: 42,
                    height: 38,
                    p: '2px',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--surface-2)',
                    cursor: disabled ? 'default' : 'pointer',
                }}
            />
            <Box
                component="input"
                disabled={disabled}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="#RRGGBB"
                sx={inputSx}
            />
        </Box>
    </Box>
);

ColorRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    help: PropTypes.string,
};

const PreviewPanel = ({ title, state }) => (
    <Panel header={title}>
        <Box
            sx={{
                p: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                minHeight: 160,
            }}
        >
            {state.error && (
                <Alert severity="warning" sx={{ width: '100%' }}>
                    {state.error}
                </Alert>
            )}
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {state.url && (
                    <Box
                        component="img"
                        src={state.url}
                        alt={title}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: { xs: '30vh', md: '42vh' },
                            borderRadius: 'var(--r-sm)',
                            border: '1px solid var(--line)',
                            opacity: state.loading ? 0.5 : 1,
                            transition: 'opacity 0.15s',
                        }}
                    />
                )}
                {state.loading && (
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

PreviewPanel.propTypes = { title: PropTypes.string.isRequired, state: PropTypes.object.isRequired };

const colorsForm = (source) => ({
    primary_color: source.primary_color || '#000000',
    secondary_color: source.secondary_color || '#000000',
    tertiary_color: source.tertiary_color || '#000000',
});

const ColorsEditor = forwardRef(({ team, source, isAdmin, canEditTertiary, onSave, onDirtyChange }, ref) => {
    const sourceForm = useMemo(() => colorsForm(source), [source]);
    const { form, changeForm, saving, error, saved, save } = useAppearanceDraft(sourceForm, onDirtyChange);

    const previewBody = useMemo(() => ({ colors: form }), [form]);
    const scorebug = useAppearancePreview(team, 'SCOREBUG', previewBody);
    const uniform = useAppearancePreview(team, 'UNIFORM', previewBody);

    const change = (key, value) => {
        changeForm((current) => ({ ...current, [key]: value }));
    };

    const doSave = async () => {
        await save(async (draft) => {
            const payload = {};
            if (isAdmin) {
                payload.primary_color = draft.primary_color;
                payload.secondary_color = draft.secondary_color;
            }
            if (canEditTertiary) {
                payload.tertiary_color = draft.tertiary_color;
            }
            return colorsForm(await onSave(payload));
        });
    };

    const submit = async (event) => {
        event.preventDefault();
        await doSave();
    };

    useImperativeHandle(ref, () => ({ save: doSave }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Box
                component="form"
                onSubmit={submit}
                sx={{ border: '1px solid var(--line)', borderRadius: '10px', background: 'var(--surface)' }}
            >
                <Box sx={toolbarSx}>
                    <Box sx={toolbarTitleSx}>Team colors</Box>
                    <Box sx={{ flex: 1 }} />
                    {saved && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700 }}>Saved</Box>}
                    {(isAdmin || canEditTertiary) && (
                        <Box component="button" type="submit" disabled={saving} sx={primaryButtonSx}>
                            {saving ? 'Saving...' : 'Save'}
                        </Box>
                    )}
                </Box>
                <Box sx={{ p: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {!isAdmin && (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>
                            Only admins and commissioners can change primary and secondary.
                        </Box>
                    )}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                            gap: '14px',
                        }}
                    >
                        <ColorRow
                            label="Primary"
                            value={form.primary_color}
                            onChange={(value) => change('primary_color', value)}
                            disabled={!isAdmin}
                        />
                        <ColorRow
                            label="Secondary"
                            value={form.secondary_color}
                            onChange={(value) => change('secondary_color', value)}
                            disabled={!isAdmin}
                        />
                        <ColorRow
                            label="Tertiary"
                            value={form.tertiary_color}
                            onChange={(value) => change('tertiary_color', value)}
                            disabled={!canEditTertiary}
                        />
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
                    gap: '14px',
                }}
            >
                <PreviewPanel title="Scorebug" state={scorebug} />
                <PreviewPanel title="Uniform" state={uniform} />
            </Box>
        </Box>
    );
});

ColorsEditor.displayName = 'ColorsEditor';

ColorsEditor.propTypes = {
    team: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    canEditTertiary: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onDirtyChange: PropTypes.func,
};

export default ColorsEditor;
