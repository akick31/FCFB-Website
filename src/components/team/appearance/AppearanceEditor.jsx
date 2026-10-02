import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import AppearanceControl from './AppearanceControl';
import LivePreview from './LivePreview';
import { formFrom, payloadFrom } from './appearanceSections';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const helpSx = { color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const AppearanceEditor = ({ team, view, half, sections, source, canEdit, onSave, teamColors, wallTextDefault, extraPreviews = [], previewLabel = 'Live preview', onDirtyChange }) => {
    const [form, setForm] = useState(() => formFrom(sections, source, teamColors));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        setForm(formFrom(sections, source, teamColors));
        setError(null);
        setSaved(false);
        onDirtyChange?.(false);
    }, [sections, source, teamColors]);

    const previewBody = useMemo(() => ({ [half]: payloadFrom(sections, form) }), [half, sections, form]);

    const change = (key, value) => {
        setSaved(false);
        onDirtyChange?.(true);
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
            onDirtyChange?.(false);
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
                        <Box key={section.title} sx={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', p: '14px' }}>
                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.03em', color: 'var(--brand)', borderBottom: '1px solid var(--line)', pb: '8px', mb: section.help ? '4px' : '12px' }}>{section.title}</Box>
                            {section.help && <Box sx={{ ...helpSx, mt: 0, mb: '12px' }}>{section.help}</Box>}
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', position: { md: 'sticky' }, top: { md: '16px' } }}>
                <LivePreview title={previewLabel} team={team} view={view} body={previewBody} note="Unsaved edits shown here. Save to apply." />
                {extraPreviews.map((extra) => (
                    <LivePreview key={extra.view} title={extra.label} team={team} view={extra.view} body={previewBody} />
                ))}
            </Box>
        </Box>
    );
};

AppearanceEditor.propTypes = {
    team: PropTypes.string.isRequired,
    view: PropTypes.string.isRequired,
    half: PropTypes.oneOf(['uniform', 'field']).isRequired,
    sections: PropTypes.array.isRequired,
    source: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    teamColors: PropTypes.object,
    wallTextDefault: PropTypes.string,
    extraPreviews: PropTypes.arrayOf(PropTypes.shape({ view: PropTypes.string, label: PropTypes.string })),
    previewLabel: PropTypes.string,
    onDirtyChange: PropTypes.func,
};

export default AppearanceEditor;
