import React, { useEffect, useState } from 'react';
import { Box, Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import PropTypes from 'prop-types';
import FactList from '../ui/FactList';
import { updateStadium } from '../../api/stadiumApi';
import { checkIfUserIsAdmin } from '../../utils/utils';
import { DEFAULT_COUNTRY } from './countries';
import { useCountries } from '../../hooks/useCountries';

import { locationOf } from './stadiumUsage';
import { DOME_STYLES } from '../team/appearance/appearanceSections';
import { inputSx, labelSx, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const fromStadium = (stadium) => ({
    name: stadium.name || '',
    city: stadium.city || '',
    state: stadium.state || '',
    country: stadium.country || DEFAULT_COUNTRY,
    capacity: stadium.capacity ?? '',
    dome_style: stadium.design?.dome_style || 'NONE',
});

const ADMIN_ONLY = ['city', 'state', 'country'];

const FIELDS = [
    ['name', 'Name'],
    ['city', 'City'],
    ['state', 'State / Province'],
    ['country', 'Country'],
    ['capacity', 'Capacity'],
    ['dome_style', 'Roof'],
];

const StadiumDetails = ({ stadium, canEdit, onSaved }) => {
    const [canMove] = useState(checkIfUserIsAdmin);
    const countries = useCountries();
    const [open, setOpen] = useState(false);
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
                country: form.country,
                capacity: form.capacity === '' ? null : Number(form.capacity),
                dome_style: form.dome_style,
            });
            onSaved(saved);
            setOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const summary = [
        locationOf(stadium),
        stadium.capacity ? `${Number(stadium.capacity).toLocaleString()} seats` : null,
    ];

    return (
        <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ fontWeight: 800, fontSize: '0.92rem' }}>{stadium.name}</Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                        {summary.some(Boolean) ? <FactList items={summary} /> : 'No location set'}
                    </Box>
                </Box>
                {canEdit && (
                    <Box
                        component="button"
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-expanded={open}
                        sx={secondaryButtonSx}
                    >
                        Edit details
                    </Box>
                )}
            </Box>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
                <DialogTitle sx={{ fontWeight: 800 }}>Stadium details</DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        onSubmit={save}
                        sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '6px' }}
                    >
                        {error && <Alert severity="error">{error}</Alert>}
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr 1fr', md: '1.8fr 1.1fr 0.7fr 1.2fr 0.9fr 1.5fr auto' },
                                gap: '10px',
                                alignItems: 'end',
                            }}
                        >
                            {FIELDS.map(([key, label]) => (
                                <Box
                                    key={key}
                                    sx={
                                        key === 'name' || key === 'country'
                                            ? { gridColumn: { xs: '1 / -1', md: 'auto' } }
                                            : undefined
                                    }
                                >
                                    <Box component="label" sx={labelSx} htmlFor={`stadium-${key}`}>
                                        {label}
                                    </Box>
                                    {key === 'dome_style' ? (
                                        <Box
                                            component="select"
                                            id="stadium-dome_style"
                                            value={form.dome_style}
                                            onChange={change('dome_style')}
                                            sx={inputSx}
                                        >
                                            {DOME_STYLES.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Box>
                                    ) : key === 'country' ? (
                                        <Box
                                            component="select"
                                            id="stadium-country"
                                            value={form.country}
                                            onChange={change('country')}
                                            disabled={!canMove}
                                            sx={inputSx}
                                        >
                                            {[...new Set([form.country, ...countries])].map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            component="input"
                                            id={`stadium-${key}`}
                                            type={key === 'capacity' ? 'number' : 'text'}
                                            value={form[key]}
                                            onChange={change(key)}
                                            disabled={ADMIN_ONLY.includes(key) && !canMove}
                                            sx={inputSx}
                                        />
                                    )}
                                </Box>
                            ))}
                            <Box
                                component="button"
                                type="submit"
                                disabled={saving || !dirty || !form.name.trim()}
                                sx={{ ...primaryButtonSx, gridColumn: { xs: '1 / -1', md: 'auto' } }}
                            >
                                {saving ? 'Saving...' : 'Save details'}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

StadiumDetails.propTypes = {
    stadium: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSaved: PropTypes.func.isRequired,
};

export default StadiumDetails;
