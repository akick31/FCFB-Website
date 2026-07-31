import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import Panel from '../../components/ui/Panel';
import TeamMark from '../../components/ui/TeamMark';
import { getFilteredRecords } from '../../api/recordsApi';
import { getAllTeams } from '../../api/teamApi';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';
import { useConferencesMap, activeConferenceList, conferenceLabel } from '../../components/constants/conferences';
import { recordGroup, recordOrder, recordLabel, RECORD_GROUP_ORDER, SEASON_EXCLUDED_RECORDS, EXCLUDED_RECORDS } from '../../utils/recordCategories';
import { useSeo } from '../../hooks/useSeo';

const SCOPE_TABS = [
    { value: 'league', label: 'League' },
    { value: 'conference', label: 'Conference' },
    { value: 'team', label: 'Team' },
];
const RECORD_TABS = [
    { value: 'single_game', label: 'Single game' },
    { value: 'single_season', label: 'Single season' },
];
const TAB_VALUES = RECORD_TABS.map((tab) => tab.value);
const RECORD_TYPE = { single_game: 'SINGLE_GAME', single_season: 'SINGLE_SEASON' };
const RECORD_TYPE_LOWEST = { single_game: 'SINGLE_GAME_LOWEST', single_season: 'SINGLE_SEASON_LOWEST' };
const GROUP_ORDER = [...RECORD_GROUP_ORDER, 'Other'];

const unwrapContent = (result) => (Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : []);

const recordMeta = (record) => {
    const parts = [];
    if (record.coach) parts.push(`@${record.coach}`);
    if (record.week) parts.push(`S${record.season_number} WK${record.week}`);
    else if (record.season_number) parts.push(`S${record.season_number}`);
    return parts;
};

const bestPerStat = (list, direction) => {
    const byName = new Map();
    list.forEach((record) => {
        const current = byName.get(record.record_name);
        const better = direction === 'min' ? record.record_value < current?.record_value : record.record_value > current?.record_value;
        if (!current || better) byName.set(record.record_name, record);
    });
    return [...byName.values()];
};

const RecordRow = ({ record, teamsMap }) => {
    const navigate = useNavigate();
    ensureTeam(record.record_team);
    const gameId = record.game_id;
    return (
        <Box
            onClick={gameId ? () => navigate(`/game-details/${gameId}`) : undefined}
            sx={{
                px: 1.75,
                py: 1.2,
                borderBottom: '1px solid var(--line-soft)',
                '&:last-of-type': { borderBottom: 'none' },
                ...(gameId ? { cursor: 'pointer', '&:hover': { background: 'var(--surface-2)' } } : {}),
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ fontWeight: 700, fontSize: '1rem' }}>{recordLabel(record.record_name)}</Box>
                <Box component="span" className="num" sx={{ ml: 'auto', fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>
                    {record.record_value % 1 ? Number(record.record_value).toFixed(1) : record.record_value}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'var(--text-dim)', fontSize: '0.78rem', mt: 0.5 }}>
                {record.record_team && <TeamMark team={teamsMap[record.record_team] || { name: record.record_team }} size={16} />}
                <Box component="span" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>{record.record_team}</Box>
                {recordMeta(record).map((part) => (
                    <React.Fragment key={part}><Box component="span">-</Box><Box component="span">{part}</Box></React.Fragment>
                ))}
            </Box>
        </Box>
    );
};

RecordRow.propTypes = { record: PropTypes.object.isRequired, teamsMap: PropTypes.object.isRequired };

const RecordsBoard = ({ user }) => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();
    const activeTab = TAB_VALUES.includes(tab) ? tab : 'single_game';

    const [scope, setScope] = useState('league');
    const [teams, setTeams] = useState([]);
    const [conference, setConference] = useState('');
    const [team, setTeam] = useState('');
    const [rows, setRows] = useState({ highest: [], lowest: [] });
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useSeo({ title: 'Records | FCFB', description: 'All-time league, conference, and team records across Fake College Football.' });

    useEffect(() => {
        if (!tab) navigate('/records/single_game', { replace: true });
    }, [tab, navigate]);

    useEffect(() => {
        let active = true;
        (async () => {
            const allTeams = await getAllTeams().catch(() => []);
            if (!active) return;
            const activeTeams = (allTeams || []).filter((entry) => entry.active && entry.name).sort((a, b) => a.name.localeCompare(b.name));
            setTeams(activeTeams);
            const preferred = activeTeams.find((entry) => entry.name === user?.team) || activeTeams[0];
            setTeam(preferred?.name || '');
        })();
        return () => { active = false; };
    }, [user?.team]);

    useEffect(() => {
        if (conference || Object.keys(conferencesMap).length === 0) return;
        setConference(activeConferenceList()[0]?.code || '');
    }, [conferencesMap, conference]);

    const scopeValue = scope === 'conference' ? conference : scope === 'team' ? team : null;
    const scopeReady = scope === 'league' || (scope === 'conference' && conference) || (scope === 'team' && team);

    useEffect(() => {
        if (!scopeReady) return;
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const [highest, lowest] = await Promise.all([
                    getFilteredRecords(null, null, RECORD_TYPE[activeTab], null, 0, 1000, scope.toUpperCase(), scopeValue).then(unwrapContent).catch(() => []),
                    getFilteredRecords(null, null, RECORD_TYPE_LOWEST[activeTab], null, 0, 1000, scope.toUpperCase(), scopeValue).then(unwrapContent).catch(() => []),
                ]);
                if (active) setRows({ highest, lowest });
            } catch {
                if (active) setError('Failed to load records. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [activeTab, scope, scopeValue, scopeReady]);

    const { byGroup, availableGroups } = useMemo(() => {
        const highestBest = bestPerStat(rows.highest, 'max');
        const highestNames = new Set(highestBest.map((record) => record.record_name));
        const lowestOnly = bestPerStat(rows.lowest, 'min').filter((record) => !highestNames.has(record.record_name));
        const merged = [...highestBest, ...lowestOnly];

        const seasonView = activeTab === 'single_season';
        const grouped = {};
        merged.forEach((record) => {
            const key = String(record.record_name).toLowerCase();
            if (EXCLUDED_RECORDS.has(key)) return;
            if (seasonView && SEASON_EXCLUDED_RECORDS.has(key)) return;
            if (!seasonView && key === 'largest_deficit' && scope !== 'team') return;
            const group = recordGroup(record.record_name, { seasonView });
            (grouped[group] = grouped[group] || []).push(record);
        });
        Object.values(grouped).forEach((groupRows) =>
            groupRows.sort((a, b) => recordOrder(a.record_name, { seasonView }) - recordOrder(b.record_name, { seasonView })),
        );
        return { byGroup: grouped, availableGroups: GROUP_ORDER.filter((group) => grouped[group]?.length) };
    }, [rows, activeTab, scope]);

    useEffect(() => {
        if (availableGroups.length && !availableGroups.includes(category)) setCategory(availableGroups[0]);
    }, [availableGroups, category]);

    const activeCategory = availableGroups.includes(category) ? category : availableGroups[0];
    const categoryRows = activeCategory ? byGroup[activeCategory] || [] : [];

    return (
        <PageWrap>
            <PageHeading eyebrow="All-time" title="Records">
                <SegTabs value={scope} onChange={setScope} options={SCOPE_TABS} ariaLabel="Record scope" />
            </PageHeading>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <SegTabs value={activeTab} onChange={(value) => navigate(`/records/${value}`)} options={RECORD_TABS} ariaLabel="Record type" />
                {scope === 'conference' && (
                    <SelectPill label="Conference" value={conference} onChange={setConference} options={activeConferenceList().map((entry) => ({ value: entry.code, label: entry.label }))} sx={{ height: 38 }} />
                )}
                {scope === 'team' && teams.length > 0 && (
                    <SelectPill label="Team" value={team} onChange={setTeam} options={teams.map((entry) => ({ value: entry.name, label: entry.name }))} sx={{ height: 38 }} />
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {scope === 'conference' && <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: 2, fontWeight: 700 }}>{conferenceLabel(conference)} records</Box>}

            {!loading && availableGroups.length > 0 && (
                <Box role="tablist" aria-label="Record category" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {availableGroups.map((group) => {
                        const on = group === activeCategory;
                        return (
                            <Box
                                key={group}
                                component="button"
                                type="button"
                                role="tab"
                                aria-selected={on}
                                onClick={() => setCategory(group)}
                                sx={{
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--r-sm)',
                                    background: on ? 'var(--brand-deep)' : 'var(--surface)',
                                    color: on ? '#fff' : 'var(--text-muted)',
                                    font: 'inherit',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    padding: '8px 15px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    '&:hover': on ? {} : { background: 'var(--surface-2)' },
                                }}
                            >
                                {group}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : categoryRows.length === 0 ? (
                <Box sx={{ color: 'var(--text-muted)', py: 6, textAlign: 'center' }}>No records yet for this view.</Box>
            ) : (
                <Panel header={activeCategory} more={`${categoryRows.length}`}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: '16px' }}>
                        {[categoryRows.slice(0, Math.ceil(categoryRows.length / 2)), categoryRows.slice(Math.ceil(categoryRows.length / 2))].map((column, index) => (
                            <Box key={index}>
                                {column.map((record) => <RecordRow key={record.record_name} record={record} teamsMap={teamsMap} />)}
                            </Box>
                        ))}
                    </Box>
                </Panel>
            )}
        </PageWrap>
    );
};

RecordsBoard.propTypes = { user: PropTypes.object };

export default RecordsBoard;
