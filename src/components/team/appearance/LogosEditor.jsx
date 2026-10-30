import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import LogoUrlField from '../../admin/LogoUrlField';
import { useAppearancePreview } from './useAppearancePreview';
import { useAppearanceDraft } from '../../../hooks/useAppearanceDraft';
import { toDarkLogo } from '../../../utils/teamLogo';
import { primaryButtonSx } from '../../../styles/controls';

const PreviewPanel = ({ title, state, bg }) => (
    <Panel header={title}>
        <Box
            sx={{
                p: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                minHeight: 150,
            }}
        >
            {state.error && (
                <Alert severity="warning" sx={{ width: '100%' }}>
                    {state.error}
                </Alert>
            )}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    background: bg,
                    borderRadius: 'var(--r-sm)',
                }}
            >
                {state.url && (
                    <Box
                        component="img"
                        src={state.url}
                        alt={title}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: { xs: '30vh', md: '42vh' },
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

PreviewPanel.propTypes = {
    title: PropTypes.string.isRequired,
    state: PropTypes.object.isRequired,
    bg: PropTypes.string,
};

const logosForm = (source) => ({
    logo: source.logo || '',
    logoDark: source.logo_dark || '',
    secondaryLogo: source.secondary_logo || '',
});

const LogosEditor = forwardRef(({ team, source, canEdit, onSave, onDirtyChange }, ref) => {
    const sourceForm = useMemo(() => logosForm(source), [source]);
    const { form, changeForm, saving, error, saved, save } = useAppearanceDraft(sourceForm, onDirtyChange);

    const previewBody = useMemo(
        () => ({ logo: form.logo, logo_dark: form.logoDark, secondary_logo: form.secondaryLogo }),
        [form]
    );
    const uniform = useAppearancePreview(team, 'UNIFORM', previewBody);
    const fieldPreview = useAppearancePreview(team, 'FIELD', previewBody);

    const change = (key, value) => {
        changeForm((current) => ({ ...current, [key]: value }));
    };

    const doSave = async () => {
        await save(async (draft) =>
            logosForm(
                await onSave({
                    logo: draft.logo || null,
                    logo_dark: draft.logoDark || null,
                    secondary_logo: draft.secondaryLogo || null,
                })
            )
        );
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
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        p: '8px 14px',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    <Box sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Team logos</Box>
                    <Box sx={{ flex: 1 }} />
                    {saved && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700 }}>Saved</Box>}
                    {canEdit ? (
                        <Box component="button" type="submit" disabled={saving} sx={primaryButtonSx}>
                            {saving ? 'Saving...' : 'Save'}
                        </Box>
                    ) : (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Admins only</Box>
                    )}
                </Box>
                <Box sx={{ p: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <Box
                        component="fieldset"
                        disabled={!canEdit}
                        sx={{
                            border: 0,
                            p: 0,
                            m: 0,
                            minWidth: 0,
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
                            gap: '14px',
                        }}
                    >
                        <LogoUrlField
                            label="Primary logo"
                            value={form.logo}
                            onChange={(value) => change('logo', value)}
                            uploadKind="TEAM"
                            previewBg="#ffffff"
                        />
                        <LogoUrlField
                            label="Primary logo (dark backgrounds)"
                            value={form.logoDark}
                            onChange={(value) => change('logoDark', value)}
                            uploadKind="TEAM"
                            fallback={toDarkLogo(form.logo) || undefined}
                            placeholder="Automatic from primary logo"
                            previewBg="#0a1620"
                        />
                        <LogoUrlField
                            label="Secondary logo"
                            value={form.secondaryLogo}
                            onChange={(value) => change('secondaryLogo', value)}
                            uploadKind="TEAM"
                            placeholder="None"
                            previewBg="#ffffff"
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
                <PreviewPanel title="Uniform" state={uniform} />
                <PreviewPanel title="Field" state={fieldPreview} />
            </Box>
        </Box>
    );
});

LogosEditor.displayName = 'LogosEditor';

LogosEditor.propTypes = {
    team: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onDirtyChange: PropTypes.func,
};

export default LogosEditor;
