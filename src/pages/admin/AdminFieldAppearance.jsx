import { useNavigate, useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import SegTabs from '../../components/ui/SegTabs';
import FieldSettingsEditor from '../../components/admin/fieldAppearance/FieldSettingsEditor';
import PostseasonFieldThumb from '../../components/admin/fieldAppearance/PostseasonFieldThumb';
import EventPicker from '../../components/admin/fieldAppearance/EventPicker';
import BowlMetaEditor from '../../components/admin/fieldAppearance/BowlMetaEditor';
import EventStadiumTab from '../../components/admin/fieldAppearance/EventStadiumTab';
import {
    BOWL_SECTIONS,
    PLAYOFF_SECTIONS,
    CCG_SECTIONS,
    NC_SECTIONS,
} from '../../components/admin/fieldAppearance/fieldDefinitions';
import { getConferences } from '../../api/conferenceApi';
import {
    getBowlFields,
    updateBowlField,
    getPlayoffFields,
    updatePlayoffField,
    getConferenceChampionshipField,
    updateConferenceChampionshipField,
} from '../../api/fieldAppearanceApi';
import { ROUND_LABELS } from '../../constants/playoffBracket';

const ROUND_ORDER = Object.values(ROUND_LABELS);

const byLabel = (a, b) => a.label.localeCompare(b.label);

const CATEGORIES = {
    bowl: {
        label: 'Bowls',
        noun: 'bowl',
        sections: BOWL_SECTIONS,
        loadItems: async () =>
            (await getBowlFields()).map((row) => ({ id: row.bowl, label: row.bowl, source: row })).sort(byLabel),
        save: updateBowlField,
    },
    playoff: {
        label: 'Playoff rounds',
        noun: 'round',
        sections: PLAYOFF_SECTIONS,
        loadItems: async () =>
            (await getPlayoffFields())
                .map((row) => ({ id: row.round, label: row.round, source: row }))
                .sort((a, b) => ROUND_ORDER.indexOf(a.label) - ROUND_ORDER.indexOf(b.label)),
        save: updatePlayoffField,
    },
    conference: {
        label: 'Conference championships',
        noun: 'conference',
        sections: CCG_SECTIONS,
        loadItems: async () =>
            (await getConferences())
                .filter(
                    (conference) =>
                        conference.active &&
                        !/independent/i.test(conference.label || '') &&
                        !/independent/i.test(conference.code || '')
                )
                .map((conference) => ({
                    id: conference.code,
                    label: conference.label,
                    venue: conference.championship_venue,
                    logo: conference.logo_url || undefined,
                }))
                .sort(byLabel),
        loadSource: getConferenceChampionshipField,
        save: updateConferenceChampionshipField,
    },
};

const PREVIEW_CATEGORY = { bowl: 'BOWL', playoff: 'PLAYOFF', conference: 'CCG' };

const BOWL_TABS = [
    { value: 'details', label: 'Details' },
    { value: 'field', label: 'Field' },
    { value: 'stadium', label: 'Stadium' },
];

const EVENT_TABS = [
    { value: 'field', label: 'Field' },
    { value: 'stadium', label: 'Stadium' },
];

const TAB_ORDER = ['conference', 'bowl', 'playoff'];
const TAB_OPTIONS = TAB_ORDER.map((value) => ({ value, label: CATEGORIES[value].label }));

const BASE_PATH = '/admin/postseason-appearance';
const DEFAULT_CATEGORY = 'conference';
const CATEGORY_SLUGS = { conference: 'conference-championships', bowl: 'bowls', playoff: 'playoff-rounds' };
const SLUG_TO_CATEGORY = Object.fromEntries(Object.entries(CATEGORY_SLUGS).map(([cat, slug]) => [slug, cat]));
const slugify = (value) =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

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
    const [bowlDraft, setBowlDraft] = useState(null);
    const [requestedTab, setEventTab] = useState(null);
    const [loadedCategory, setLoadedCategory] = useState(null);
    const categoryScopeRef = useRef(null);
    const routeScopeRef = useRef(null);
    const categoryLoading = loading || loadedCategory !== category;

    useEffect(() => {
        const scope = { active: true };
        routeScopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, [category, itemSlug]);

    const selectedId = useMemo(
        () =>
            items.find((item) => slugify(item.id) === itemSlug)?.id ??
            (category === 'bowl' && bowlDraft ? items.find((item) => item.id === bowlDraft.bowl)?.id : null) ??
            items[0]?.id ??
            null,
        [items, itemSlug, category, bowlDraft]
    );

    useEffect(() => {
        if (!bowlDraft) {
            return;
        }
        const targetSlug = slugify(bowlDraft.bowl);
        if (
            category !== 'bowl' ||
            (itemSlug !== bowlDraft.originSlug && itemSlug !== targetSlug) ||
            (!categoryLoading && itemSlug === targetSlug && selectedId === bowlDraft.bowl)
        ) {
            setBowlDraft(null);
        }
    }, [bowlDraft, category, itemSlug, categoryLoading, selectedId]);

    const loadItems = useCallback(
        async (scope = categoryScopeRef.current) => {
            const request = {};
            scope.request = request;
            setLoading(true);
            setError(null);
            try {
                const loaded = await config.loadItems();
                if (scope.active && scope.request === request) {
                    setItems(loaded);
                    setLoadedCategory(category);
                }
            } catch (err) {
                if (scope.active && scope.request === request) {
                    setError(err.message || 'Failed to load fields');
                    setItems([]);
                    setLoadedCategory(category);
                }
            } finally {
                if (scope.active && scope.request === request) {
                    setLoading(false);
                }
            }
            return scope.active && scope.request === request;
        },
        [config, category]
    );

    useEffect(() => {
        const scope = { active: true };
        categoryScopeRef.current = scope;
        loadItems(scope);
        return () => {
            scope.active = false;
        };
    }, [loadItems]);

    useEffect(() => {
        if (categoryLoading || !selectedId) {
            return;
        }
        if (catSlug !== CATEGORY_SLUGS[category] || itemSlug !== slugify(selectedId)) {
            navigate(`${BASE_PATH}/${CATEGORY_SLUGS[category]}/${slugify(selectedId)}`, { replace: true });
        }
    }, [categoryLoading, selectedId, category, catSlug, itemSlug, navigate]);

    useEffect(() => {
        let active = true;
        const selected = !categoryLoading && items.find((item) => item.id === selectedId);
        if (!selected) {
            setSource(null);
            return undefined;
        }
        setError(null);
        if (!config.loadSource) {
            setSource(selected.source);
            return undefined;
        }
        setSource(null);
        config
            .loadSource(selected.id)
            .then((loaded) => {
                if (active) {
                    setSource(loaded);
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err.message || 'Failed to load field');
                }
            });
        return () => {
            active = false;
        };
    }, [items, selectedId, config, categoryLoading]);

    const changeCategory = (next) => navigate(`${BASE_PATH}/${CATEGORY_SLUGS[next]}`, { replace: true });
    const selectItem = (id) => navigate(`${BASE_PATH}/${CATEGORY_SLUGS[category]}/${slugify(id)}`, { replace: true });

    const save = async (payload) => {
        const scope = routeScopeRef.current;
        const saved = await config.save(selectedId, payload);
        if (!scope.active) {
            return saved;
        }
        setSource(saved);
        setItems((current) =>
            current.map((item) => (item.id === selectedId && !config.loadSource ? { ...item, source: saved } : item))
        );
        return saved;
    };

    const changeEventVenue = (venue) => {
        if (category === 'conference') {
            setItems((current) => current.map((item) => (item.id === selectedId ? { ...item, venue } : item)));
            return;
        }
        setSource((current) => ({ ...current, venue }));
        setItems((current) =>
            current.map((item) =>
                item.id === selectedId && item.source ? { ...item, source: { ...item.source, venue } } : item
            )
        );
    };

    const selected = items.find((item) => item.id === selectedId);
    const routeScope = routeScopeRef.current;
    const eventTabs = category === 'bowl' ? BOWL_TABS : EVENT_TABS;
    const eventTab = eventTabs.some((option) => option.value === requestedTab) ? requestedTab : eventTabs[0].value;

    return (
        <AdminLayout
            title="Postseason appearance"
            controls={
                <SegTabs value={category} onChange={changeCategory} options={TAB_OPTIONS} ariaLabel="Field category" />
            }
        >
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}
            {categoryLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
                    {items.length === 0 ? (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No {config.noun}s found.</Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                            <EventPicker
                                items={items}
                                selectedId={selectedId}
                                onSelect={selectItem}
                                label={config.label}
                            />
                            {selected && (
                                <SegTabs
                                    value={eventTab}
                                    onChange={setEventTab}
                                    options={eventTabs}
                                    ariaLabel="Postseason section"
                                    buttonSx={{ height: '32px' }}
                                />
                            )}
                        </Box>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {eventTab === 'details' && category === 'bowl' && selected && (
                            <BowlMetaEditor
                                key={selectedId}
                                bowl={selectedId}
                                initialDraft={bowlDraft?.bowl === selectedId ? bowlDraft.draft : undefined}
                                onSaved={(newName, draft) => {
                                    if (routeScope.active) {
                                        setBowlDraft({
                                            bowl: newName,
                                            originSlug: itemSlug,
                                            draft: draft || { name: newName, logo: '' },
                                        });
                                        loadItems().then((current) => {
                                            if (current && routeScope.active) {
                                                selectItem(newName);
                                            }
                                        });
                                    }
                                }}
                            />
                        )}
                        {eventTab === 'stadium' && selected && source && (
                            <EventStadiumTab
                                key={`${category}:${selectedId}:stadium`}
                                category={PREVIEW_CATEGORY[category]}
                                eventKey={selectedId}
                                venue={category === 'conference' ? selected.venue : source.venue}
                                onChanged={changeEventVenue}
                            />
                        )}
                        {eventTab === 'field' && selected && source && (
                            <FieldSettingsEditor
                                key={`${category}:${selectedId}`}
                                sections={
                                    category === 'playoff' && selectedId === 'National Championship'
                                        ? NC_SECTIONS
                                        : config.sections
                                }
                                source={source}
                                onSave={save}
                                preview={{ category: PREVIEW_CATEGORY[category], key: selectedId }}
                                eventLogo={selected.logo}
                                aside={
                                    category === 'playoff' ? (
                                        <Panel header="All rounds (saved)">
                                            <Box
                                                sx={{
                                                    p: '12px',
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                                    gap: '10px',
                                                }}
                                            >
                                                {ROUND_ORDER.map((round) => (
                                                    <PostseasonFieldThumb
                                                        key={round}
                                                        category="PLAYOFF"
                                                        keyName={round}
                                                        label={round}
                                                    />
                                                ))}
                                            </Box>
                                        </Panel>
                                    ) : null
                                }
                            />
                        )}
                    </Box>
                </Box>
            )}
        </AdminLayout>
    );
};

export default AdminFieldAppearance;
