import React, { useCallback, useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import SegTabs from '../../components/ui/SegTabs';
import FieldSettingsEditor from '../../components/admin/fieldAppearance/FieldSettingsEditor';
import { BOWL_SECTIONS, POSTSEASON_SECTIONS } from '../../components/admin/fieldAppearance/fieldDefinitions';
import { getConferences } from '../../api/conferenceApi';
import {
    getBowlFields,
    updateBowlField,
    getPlayoffFields,
    updatePlayoffField,
    getConferenceChampionshipField,
    updateConferenceChampionshipField,
} from '../../api/fieldAppearanceApi';
import { ROUND_LABELS } from '../../components/constants/playoffBracket';

const ROUND_ORDER = Object.values(ROUND_LABELS);

const byLabel = (a, b) => a.label.localeCompare(b.label);

const CATEGORIES = {
    bowl: {
        label: 'Bowls',
        noun: 'bowl',
        sections: BOWL_SECTIONS,
        loadItems: async () => (await getBowlFields()).map((row) => ({ id: row.bowl, label: row.bowl, source: row })).sort(byLabel),
        save: updateBowlField,
    },
    playoff: {
        label: 'Playoff rounds',
        noun: 'round',
        sections: POSTSEASON_SECTIONS,
        loadItems: async () => (await getPlayoffFields())
            .map((row) => ({ id: row.round, label: row.round, source: row }))
            .sort((a, b) => ROUND_ORDER.indexOf(a.label) - ROUND_ORDER.indexOf(b.label)),
        save: updatePlayoffField,
    },
    conference: {
        label: 'Conference championships',
        noun: 'conference',
        sections: POSTSEASON_SECTIONS,
        loadItems: async () => (await getConferences())
            .filter((conference) => conference.active)
            .map((conference) => ({ id: conference.code, label: conference.label }))
            .sort(byLabel),
        loadSource: getConferenceChampionshipField,
        save: updateConferenceChampionshipField,
    },
};

const TAB_OPTIONS = Object.entries(CATEGORIES).map(([value, category]) => ({ value, label: category.label }));

const itemButtonSx = (active) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    border: 0,
    borderBottom: '1px solid var(--line-soft)',
    background: active ? 'color-mix(in srgb, var(--brand) 10%, var(--surface))' : 'transparent',
    boxShadow: active ? 'inset 3px 0 0 var(--live)' : 'none',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 600,
    px: '14px',
    py: '10px',
    cursor: 'pointer',
    '&:hover': { background: active ? undefined : 'var(--surface-2)' },
});

const AdminFieldAppearance = () => {
    const [category, setCategory] = useState('bowl');
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const config = CATEGORIES[category];

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const loaded = await CATEGORIES[category].loadItems();
            setItems(loaded);
            setSelectedId((current) => (loaded.some((item) => item.id === current) ? current : loaded[0]?.id ?? null));
        } catch (err) {
            setError(err.message || 'Failed to load fields');
            setItems([]);
            setSelectedId(null);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => { loadItems(); }, [loadItems]);

    useEffect(() => {
        const selected = items.find((item) => item.id === selectedId);
        if (!selected) {
            setSource(null);
            return;
        }
        if (!config.loadSource) {
            setSource(selected.source);
            return;
        }
        setSource(null);
        config.loadSource(selected.id)
            .then(setSource)
            .catch((err) => setError(err.message || 'Failed to load field'));
    }, [items, selectedId, config]);

    const changeCategory = (next) => {
        setItems([]);
        setSelectedId(null);
        setSource(null);
        setCategory(next);
    };

    const save = async (payload) => {
        const saved = await config.save(selectedId, payload);
        setSource(saved);
        setItems((current) => current.map((item) => (item.id === selectedId && !config.loadSource ? { ...item, source: saved } : item)));
    };

    const selected = items.find((item) => item.id === selectedId);

    return (
        <AdminLayout title="Field appearance" controls={<SegTabs value={category} onChange={changeCategory} options={TAB_OPTIONS} ariaLabel="Field category" />}>
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}><CircularProgress /></Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: '16px', alignItems: 'start' }}>
                    <Panel header={config.label}>
                        {items.map((item) => (
                            <Box key={item.id} component="button" type="button" onClick={() => setSelectedId(item.id)} sx={itemButtonSx(item.id === selectedId)}>
                                {item.label}
                            </Box>
                        ))}
                        {items.length === 0 && <Box sx={{ p: '16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>No {config.noun}s found.</Box>}
                    </Panel>
                    {selected && source && (
                        <FieldSettingsEditor title={selected.label} sections={config.sections} source={source} onSave={save} />
                    )}
                </Box>
            )}
        </AdminLayout>
    );
};

export default AdminFieldAppearance;
