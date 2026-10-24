import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import { updateStadium } from '../../api/stadiumApi';
import { buttonSx, inputSx, labelSx } from './stadiumStyles';

const fromStadium = (stadium) => ({
    name: stadium.name || '',
    city: stadium.city || '',
    state: stadium.state || '',
    capacity: stadium.capacity ?? '',
});

const StadiumDetails = ({ stadium, canEdit, onSaved }) => {
    const [form, setForm] = useState(fromStadium(stadium));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => setForm(fromStadium(stadium)), [stadium]);

    const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
    const dirty = JSON.stringify(form) !== JSON.stringify(fromStadium(stadium));

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const saved = await updateStadium(stadium.name, {
                name: form.name.trim(),
                city: form.city.trim() || null,
                state: form.state.trim() || null,
                capacity: form.capacity === '' ? null : Number(form.capacity),
            });
            onSaved(saved);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Panel header="Stadium details">
            <Box
                component="form"
                onSubmit={save}
                sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
                {error && <Alert severity="error">{error}</Alert>}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    {[
                        ['name', 'Name'],
                        ['city', 'City'],
                        ['state', 'State'],
                        ['capacity', 'Capacity'],
                    ].map(([key, label]) => (
                        <Box key={key}>
                            <Box component="label" sx={labelSx} htmlFor={`stadium-${key}`}>
                                {label}
                            </Box>
                            <Box
                                component="input"
                                id={`stadium-${key}`}
                                type={key === 'capacity' ? 'number' : 'text'}
                                value={form[key]}
                                onChange={change(key)}
                                disabled={!canEdit}
                                sx={inputSx}
                            />
                        </Box>
                    ))}
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                    Renaming keeps this stadium&apos;s design and moves every team, game and event that uses it to the
                    new name.
                </Box>
                {canEdit && (
                    <Box>
                        <Box
                            component="button"
                            type="submit"
                            disabled={saving || !dirty || !form.name.trim()}
                            sx={buttonSx}
                        >
                            {saving ? 'Saving...' : 'Save details'}
                        </Box>
                    </Box>
                )}
            </Box>
        </Panel>
    );
};

StadiumDetails.propTypes = {
    stadium: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSaved: PropTypes.func.isRequired,
};

export default StadiumDetails;
