import React, { useState } from 'react';
import { Alert, Box } from '@mui/material';
import PropTypes from 'prop-types';
import EditDialog from '../ui/EditDialog';
import LogoUrlField from './LogoUrlField';
import { createConference } from '../../api/conferenceApi';
import { refreshConferences } from '../../hooks/useConferencesMap';
import { inputSx, labelSx, primaryButtonSx } from '../../styles/controls';

const emptyForm = { code: '', label: '', logoUrl: '', logoUrlDark: '' };

const ConferenceCreateDialog = ({ open, onClose, onCreated }) => {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const change = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await createConference({
                code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
                label: form.label.trim(),
                logoUrl: form.logoUrl.trim() || null,
                logoUrlDark: form.logoUrlDark.trim() || null,
            });
            refreshConferences();
            setForm(emptyForm);
            onCreated();
        } catch (err) {
            setError(err.message || 'Failed to create conference');
        } finally {
            setSaving(false);
        }
    };

    return (
        <EditDialog open={open} onClose={onClose} title="Add conference" maxWidth="sm">
            <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {error && <Alert severity="error">{error}</Alert>}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '12px' }}>
                    <Box>
                        <Box component="label" sx={labelSx}>
                            Code
                        </Box>
                        <Box
                            component="input"
                            aria-label="Code"
                            value={form.code}
                            onChange={(e) => change('code', e.target.value)}
                            required
                            sx={inputSx}
                        />
                    </Box>
                    <Box>
                        <Box component="label" sx={labelSx}>
                            Label
                        </Box>
                        <Box
                            component="input"
                            aria-label="Label"
                            value={form.label}
                            onChange={(e) => change('label', e.target.value)}
                            required
                            sx={inputSx}
                        />
                    </Box>
                </Box>
                <LogoUrlField
                    label="Logo URL"
                    value={form.logoUrl}
                    onChange={(value) => change('logoUrl', value)}
                    uploadKind="CONFERENCE"
                />
                <LogoUrlField
                    label="Dark logo URL"
                    value={form.logoUrlDark}
                    onChange={(value) => change('logoUrlDark', value)}
                    uploadKind="CONFERENCE"
                    fallback={form.logoUrl || undefined}
                    placeholder="Using the light logo"
                    previewBg="#0a1620"
                />
                <Box component="button" type="submit" disabled={saving} sx={{ ...primaryButtonSx, alignSelf: 'start' }}>
                    {saving ? 'Adding...' : 'Add conference'}
                </Box>
            </Box>
        </EditDialog>
    );
};

ConferenceCreateDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreated: PropTypes.func.isRequired,
};

export default ConferenceCreateDialog;
