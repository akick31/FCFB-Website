import { useNavigate, useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import BackButton from '../../components/ui/BackButton';
import Panel from '../../components/ui/Panel';
import SegTabs from '../../components/ui/SegTabs';
import FieldSettingsEditor from '../../components/admin/fieldAppearance/FieldSettingsEditor';
import PostseasonFieldThumb from '../../components/admin/fieldAppearance/PostseasonFieldThumb';
import BowlMetaEditor from '../../components/admin/fieldAppearance/BowlMetaEditor';
import { BOWL_SECTIONS, PLAYOFF_SECTIONS, CCG_SECTIONS, NC_SECTIONS } from '../../components/admin/fieldAppearance/fieldDefinitions';
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
        sections: PLAYOFF_SECTIONS,
        loadItems: async () => (await getPlayoffFields())
            .map((row) => ({ id: row.round, label: row.round, source: row }))
            .sort((a, b) => ROUND_ORDER.indexOf(a.label) - ROUND_ORDER.indexOf(b.label)),
        save: updatePlayoffField,
    },
    conference: {
        label: 'Conference championships',
        noun: 'conference',
        sections: CCG_SECTIONS,
        loadItems: async () => (await getConferences())
            .filter((conference) => conference.active && !/independent/i.test(conference.label || '') && !/independent/i.test(conference.code || ''))
            .map((conference) => ({ id: conference.code, label: conference.label }))
            .sort(byLabel),
        loadSource: getConferenceChampionshipField,
        save: updateConferenceChampionshipField,
    },
};

const PREVIEW_CATEGORY = { bowl: 'BOWL', playoff: 'PLAYOFF', conference: 'CCG' };

const TAB_ORDER = ['conference', 'bowl', 'playoff'];
const TAB_OPTIONS = TAB_ORDER.map((value) => ({ value, label: CATEGORIES[value].label }));

const BASE_PATH = '/admin/postseason-appearance';
const DEFAULT_CATEGORY = 'conference';
const CATEGORY_SLUGS = { conference: 'conference-championships', bowl: 'bowls', playoff: 'playoff-rounds' };
const SLUG_TO_CATEGORY = Object.fromEntries(Object.entries(CATEGORY_SLUGS).map(([cat, slug]) => [slug, cat]));
const slugify = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const selectSx = {
    minWidth: 280,
    maxWidth: '100%',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    height: '40px',
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
};

const AdminFieldAppearance = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [catSlug, itemSlug] = (params['*'] || '').split('/');
    const category = SLUG_TO_CATEGORY[catSlug] || DEFAULT_CATEGORY;
    const config = CATEGORIES[category];

    const [items, setItems] = useState([]);
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const selectedId = useMemo(
        () => items.find((item) => slugify(item.id) === itemSlug)?.id ?? items[0]?.id ?? null,
        [items, itemSlug],
    );

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await config.loadItems());
        } catch (err) {
            setError(err.message || 'Failed to load fields');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [config]);

    useEffect(() => { loadItems(); }, [loadItems]);

    useEffect(() => {
        if (loading || !selectedId) return;
        if (catSlug !== CATEGORY_SLUGS[category] || itemSlug !== slugify(selectedId)) {
            navigate(`${BASE_PATH}/${CATEGORY_SLUGS[category]}/${slugify(selectedId)}`, { replace: true });
        }
    }, [loading, selectedId, category, catSlug, itemSlug, navigate]);

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

    const changeCategory = (next) => navigate(`${BASE_PATH}/${CATEGORY_SLUGS[next]}`, { replace: true });
    const selectItem = (id) => navigate(`${BASE_PATH}/${CATEGORY_SLUGS[category]}/${slugify(id)}`, { replace: true });

    const save = async (payload) => {
        const saved = await config.save(selectedId, payload);
        setSource(saved);
        setItems((current) => current.map((item) => (item.id === selectedId && !config.loadSource ? { ...item, source: saved } : item)));
    };

    const selected = items.find((item) => item.id === selectedId);

    return (
        <AdminLayout title="Postseason appearance" controls={<SegTabs value={category} onChange={changeCategory} options={TAB_OPTIONS} ariaLabel="Field category" />}>
            <BackButton onBack={() => navigate(-1)} />
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}><CircularProgress /></Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
                    {items.length === 0 ? (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No {config.noun}s found.</Box>
                    ) : (
                        <Box component="select" value={selectedId || ''} onChange={(event) => selectItem(event.target.value)} sx={selectSx} aria-label={config.label}>
                            {items.map((item) => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </Box>
                    )}
                    <Box>
                    {category === 'bowl' && selected && (
                        <BowlMetaEditor
                            bowl={selectedId}
                            onSaved={(newName) => { loadItems().then(() => selectItem(newName)); }}
                        />
                    )}
                    {selected && source && (
                        <FieldSettingsEditor
                            title={selected.label}
                            sections={category === 'playoff' && selectedId === 'National Championship' ? NC_SECTIONS : config.sections}
                            source={source}
                            onSave={save}
                            preview={{ category: PREVIEW_CATEGORY[category], key: selectedId }}
                            aside={category === 'playoff' ? (
                                <Panel header="All rounds (saved)">
                                    <Box sx={{ p: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                                        {ROUND_ORDER.map((round) => (
                                            <PostseasonFieldThumb key={round} category="PLAYOFF" keyName={round} label={round} />
                                        ))}
                                    </Box>
                                </Panel>
                            ) : null}
                        />
                    )}
                    </Box>
                </Box>
            )}
        </AdminLayout>
    );
};

export default AdminFieldAppearance;
