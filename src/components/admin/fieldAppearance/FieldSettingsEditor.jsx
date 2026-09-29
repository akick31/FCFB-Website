import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import Toggle from '../../ui/Toggle';
import LogoUrlField from '../LogoUrlField';
import { formFrom, payloadFrom } from './fieldDefinitions';

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

const FieldSettingsEditor = ({ title, sections, source, onSave }) => {
    const [form, setForm] = useState(() => formFrom(sections, source));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm(formFrom(sections, source));
        setError(null);
        setSaved(false);
    }, [sections, source]);

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

    return (
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
};

FieldSettingsEditor.propTypes = {
    title: PropTypes.node.isRequired,
    sections: PropTypes.array.isRequired,
    source: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default FieldSettingsEditor;
