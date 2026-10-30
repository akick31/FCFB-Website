import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import PagedFooter from '../../components/ui/PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import SegTabs from '../../components/ui/SegTabs';
import ConferencePill from '../../components/ui/ConferencePill';
import TeamFilterPill from '../../components/ui/TeamFilterPill';
import Panel from '../../components/ui/Panel';
import TeamName from '../../components/ui/TeamName';
import FactList from '../../components/ui/FactList';
import { getFilteredRecords } from '../../api/recordsApi';
import { getAllTeamsIncludingInactive } from '../../api/teamApi';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';
import { useConferencesMap, realConferenceList, conferenceLabel } from '../../hooks/useConferencesMap';
import {
    recordGroup,
    recordOrder,
    recordLabel,
    RECORD_GROUP_ORDER,
    SEASON_EXCLUDED_RECORDS,
    EXCLUDED_RECORDS,
    AMBIGUOUS_DIRECTION_RECORDS,
    TIME_RECORDS,
    isPercentageRecord,
    isAverageRecord,
} from '../../utils/recordCategories';
import { isRealTeam } from '../../utils/teamDataUtils';
import { formatTime } from '../../utils/statsCatalog';
import { useSeo } from '../../hooks/useSeo';

const SCOPE_TABS = [
    { value: 'league', label: 'League' },
    { value: 'conference', label: 'Conference' },
    { value: 'team', label: 'Team' },
];
const RECORD_TABS = [
    { value: 'single_game', label: 'Single game' },
    { value: 'single_season', label: 'Single season' },
    { value: 'postseason_game', label: 'Postseason game' },
    { value: 'postseason', label: 'Postseason' },
];
const TAB_VALUES = RECORD_TABS.map((tab) => tab.value);
const RECORD_TYPE = {
    single_game: 'SINGLE_GAME',
    single_season: 'SINGLE_SEASON',
    postseason_game: 'SINGLE_POSTSEASON_GAME',
    postseason: 'SINGLE_POSTSEASON',
};
const RECORD_TYPE_LOWEST = {
    single_game: 'SINGLE_GAME_LOWEST',
    single_season: 'SINGLE_SEASON_LOWEST',
    postseason_game: 'SINGLE_POSTSEASON_GAME_LOWEST',
    postseason: 'SINGLE_POSTSEASON_LOWEST',
};
const LEAGUE_ONLY_TABS = new Set(['postseason_game', 'postseason']);
const SEASON_VIEW_TABS = new Set(['single_season', 'postseason']);
const GROUP_ORDER = [...RECORD_GROUP_ORDER, 'Other'];

const unwrapContent = (result) =>
    Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : [];

const conferenceOption = (entry) => ({ value: entry.code, label: entry.label });

const NON_CONFERENCE_NAMES = new Set(['NAIA']);

const isNonConference = (entry) => {
    const code = String(entry.code || '').toUpperCase();
    const label = String(entry.label || '').toUpperCase();
    return (
        code.endsWith('INDEPENDENT') ||
        label.endsWith('INDEPENDENT') ||
        NON_CONFERENCE_NAMES.has(code) ||
        NON_CONFERENCE_NAMES.has(label)
    );
};

const conferenceOptions = () => {
    const conferences = realConferenceList();
    const active = conferences.filter((entry) => entry.active).map(conferenceOption);
    const defunct = conferences.filter((entry) => !entry.active && !isNonConference(entry)).map(conferenceOption);
    return defunct.length ? [...active, { label: 'Defunct conferences', options: defunct }] : active;
};

const optionCodes = (options) =>
    options.flatMap((entry) => (entry.options ? entry.options : [entry])).map((entry) => entry.value);

const recordMeta = (record, teamsMap) => {
    const parts = [];
    if (record.coach) {
        parts.push(`@${record.coach}`);
    }
    if (record.week) {
        parts.push(`S${record.season_number} WK${record.week}`);
    } else if (record.season_number) {
        parts.push(`S${record.season_number}`);
    }
    if (record.home_team && record.away_team) {
        const homeAbbr = teamsMap[record.home_team]?.abbreviation || record.home_team;
        const awayAbbr = teamsMap[record.away_team]?.abbreviation || record.away_team;
        parts.push(`${awayAbbr} vs ${homeAbbr}`);
    }
    return parts;
};

const recordValue = (record) => {
    const name = String(record.record_name).toLowerCase();
    if (TIME_RECORDS.has(name)) {
        return formatTime(record.record_value);
    }
    if (isPercentageRecord(name)) {
        return `${Number(record.record_value).toFixed(1)}%`;
    }
    if (isAverageRecord(name)) {
        return Number(record.record_value).toFixed(1);
    }
    return record.record_value % 1 ? Number(record.record_value).toFixed(1) : record.record_value;
};

const directionSuffix = (record) => {
    if (!AMBIGUOUS_DIRECTION_RECORDS.has(String(record.record_name).toLowerCase())) {
        return '';
    }
    return record.record_type?.endsWith('_LOWEST') ? ' (Lowest)' : ' (Highest)';
};

const bestPerStat = (list, direction) => {
    const byName = new Map();
    list.forEach((record) => {
        const current = byName.get(record.record_name);
        const better =
            direction === 'min'
                ? record.record_value < current?.record_value
                : record.record_value > current?.record_value;
        if (!current || better) {
            byName.set(record.record_name, record);
        }
    });
    return [...byName.values()];
};

const RecordRow = ({ record, teamsMap }) => {
    useEffect(() => {
        ensureTeam(record.record_team);
        ensureTeam(record.home_team);
        ensureTeam(record.away_team);
    }, [record.record_team, record.home_team, record.away_team]);
    const gameId = record.game_id;
    return (
        <Box
            data-record-row
            component={gameId ? Link : 'div'}
            to={gameId ? `/game-details/${gameId}` : undefined}
            sx={{
                display: 'block',
                px: 1.75,
                py: 0.8,
                borderBottom: '1px solid var(--line-soft)',
                textDecoration: 'none',
                color: 'inherit',
                '&:last-of-type': { borderBottom: 'none' },
                ...(gameId ? { cursor: 'pointer', '&:hover': { background: 'var(--surface-2)' } } : {}),
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {recordLabel(record.record_name)}
                    {directionSuffix(record)}
                </Box>
                <Box
                    component="span"
                    className="num"
                    sx={{
                        ml: 'auto',
                        fontWeight: 800,
                        fontSize: '1.3rem',
                        color: 'var(--brand)',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {recordValue(record)}
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    columnGap: '14px',
                    rowGap: '2px',
                    color: 'var(--text-dim)',
                    fontSize: '0.78rem',
                    mt: 0.5,
                }}
            >
                {record.record_team && (
                    <Box sx={{ color: 'var(--text-muted)', fontWeight: 700, alignSelf: 'center' }}>
                        <TeamName name={record.record_team} size={16} />
                    </Box>
                )}
                <FactList items={recordMeta(record, teamsMap)} />
            </Box>
        </Box>
    );
};

RecordRow.propTypes = { record: PropTypes.object.isRequired, teamsMap: PropTypes.object.isRequired };

const RecordsBoard = ({ user }) => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const teamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();
    const activeTab = TAB_VALUES.includes(tab) ? tab : 'single_game';
    const isLeagueOnlyTab = LEAGUE_ONLY_TABS.has(activeTab);

    const [scope, setScope] = useState(() =>
        SCOPE_TABS.some((t) => t.value === searchParams.get('scope')) ? searchParams.get('scope') : 'league'
    );
    const [teams, setTeams] = useState([]);
    const [conference, setConference] = useState(() => searchParams.get('conference')?.toUpperCase() || '');
    const [team, setTeam] = useState(() => searchParams.get('team') || '');
    const [rows, setRows] = useState({ highest: [], lowest: [] });
    const [category, setCategory] = useState(() => searchParams.get('category') || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useSeo({
        title: 'Records | FCFB',
        description: 'All-time league, conference, and team records across Fake College Football.',
    });

    useEffect(() => {
        if (!tab) {
            navigate({ pathname: '/records/single_game', search: searchParams.toString() }, { replace: true });
        }
    }, [tab, navigate]);

    useEffect(() => {
        let active = true;
        (async () => {
            const allTeams = await getAllTeamsIncludingInactive().catch(() => []);
            if (!active) {
                return;
            }
            const realTeams = (allTeams || [])
                .filter((entry) => entry.name && isRealTeam(entry))
                .sort((a, b) => a.name.localeCompare(b.name));
            setTeams(realTeams);
            const preferred = realTeams.find((entry) => entry.name === user?.team) || realTeams[0];
            setTeam((current) => current || preferred?.name || '');
        })();
        return () => {
            active = false;
        };
    }, [user?.team]);

    const conferenceChoices = useMemo(() => conferenceOptions(), [conferencesMap]);
    const conferenceCodes = useMemo(() => optionCodes(conferenceChoices), [conferenceChoices]);

    useEffect(() => {
        if (conferenceCodes.length === 0 || conferenceCodes.includes(conference)) {
            return;
        }
        setConference(conferenceCodes[0]);
    }, [conferenceCodes, conference]);

    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        let changed = false;
        const apply = (key, value) => {
            if (value == null || value === '') {
                if (next.has(key)) {
                    next.delete(key);
                    changed = true;
                }
            } else if (next.get(key) !== value) {
                next.set(key, value);
                changed = true;
            }
        };
        apply('scope', scope !== 'league' ? scope : null);
        apply('conference', conference ? conference.toLowerCase() : null);
        apply('team', team || null);
        apply('category', category || null);
        if (changed) {
            setSearchParams(next, { replace: true });
        }
    }, [scope, conference, team, category]);

    const effectiveScope = isLeagueOnlyTab ? 'league' : scope;
    const scopeValue = effectiveScope === 'conference' ? conference : effectiveScope === 'team' ? team : null;
    const scopeReady =
        isLeagueOnlyTab ||
        effectiveScope === 'league' ||
        (effectiveScope === 'conference' && conference) ||
        (effectiveScope === 'team' && team);

    useEffect(() => {
        if (!scopeReady) {
            return;
        }
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const [highest, lowest] = await Promise.all([
                    getFilteredRecords(
                        null,
                        null,
                        RECORD_TYPE[activeTab],
                        null,
                        0,
                        1000,
                        effectiveScope.toUpperCase(),
                        scopeValue
                    )
                        .then(unwrapContent)
                        .catch(() => []),
                    getFilteredRecords(
                        null,
                        null,
                        RECORD_TYPE_LOWEST[activeTab],
                        null,
                        0,
                        1000,
                        effectiveScope.toUpperCase(),
                        scopeValue
                    )
                        .then(unwrapContent)
                        .catch(() => []),
                ]);
                if (active) {
                    setRows({ highest, lowest });
                }
            } catch {
                if (active) {
                    setError('Failed to load records. Please try again.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [activeTab, effectiveScope, scopeValue, scopeReady]);

    const { byGroup, availableGroups } = useMemo(() => {
        const highestBest = bestPerStat(rows.highest, 'max');
        const highestNames = new Set(highestBest.map((record) => record.record_name));
        const lowestBest = bestPerStat(rows.lowest, 'min');
        const lowestOnly = lowestBest.filter((record) => !highestNames.has(record.record_name));
        const lowestAlongsideHighest = lowestBest.filter((record) =>
            AMBIGUOUS_DIRECTION_RECORDS.has(String(record.record_name).toLowerCase())
        );
        const merged = [...highestBest, ...lowestOnly, ...lowestAlongsideHighest];

        const seasonView = SEASON_VIEW_TABS.has(activeTab);
        const grouped = {};
        merged.forEach((record) => {
            const key = String(record.record_name).toLowerCase();
            if (EXCLUDED_RECORDS.has(key)) {
                return;
            }
            if (seasonView && SEASON_EXCLUDED_RECORDS.has(key)) {
                return;
            }
            if (!seasonView && key === 'largest_deficit' && effectiveScope !== 'team') {
                return;
            }
            const group = recordGroup(record.record_name, { seasonView });
            (grouped[group] = grouped[group] || []).push(record);
        });
        Object.values(grouped).forEach((groupRows) =>
            groupRows.sort(
                (a, b) => recordOrder(a.record_name, { seasonView }) - recordOrder(b.record_name, { seasonView })
            )
        );
        return { byGroup: grouped, availableGroups: GROUP_ORDER.filter((group) => grouped[group]?.length) };
    }, [rows, activeTab, effectiveScope]);

    useEffect(() => {
        if (availableGroups.length && !availableGroups.includes(category)) {
            setCategory(availableGroups[0]);
        }
    }, [availableGroups, category]);

    const activeCategory = availableGroups.includes(category) ? category : availableGroups[0];
    const categoryRows = activeCategory ? byGroup[activeCategory] || [] : [];
    const [fitRef, pageSize] = useFitCount({
        itemSelector: '[data-record-row]',
        rowHeight: 62,
        columnWidth: 480,
        phoneCount: 12,
    });
    const { page, pageCount, pageRows, setPage } = usePagedRows(
        categoryRows,
        pageSize,
        `${activeTab}|${scope}|${conference}|${team}|${activeCategory}`
    );

    return (
        <PageWrap>
            <PageHeading eyebrow="All-time" title="Records">
                <SegTabs
                    value={activeTab}
                    onChange={(value) => navigate({ pathname: `/records/${value}`, search: searchParams.toString() })}
                    options={RECORD_TABS}
                    ariaLabel="Record type"
                />
                {!isLeagueOnlyTab && (
                    <SegTabs value={scope} onChange={setScope} options={SCOPE_TABS} ariaLabel="Record scope" />
                )}
            </PageHeading>

            <Box sx={{ display: 'flex', gap: 1, mb: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {!loading &&
                    availableGroups.map((group) => {
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
                                    padding: '7px 13px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    '&:hover': on ? {} : { background: 'var(--surface-2)' },
                                }}
                            >
                                {group}
                            </Box>
                        );
                    })}
                <Box sx={{ flex: 1 }} />
                {!isLeagueOnlyTab && scope === 'conference' && (
                    <ConferencePill
                        label="Conference"
                        value={conference}
                        onChange={setConference}
                        options={conferenceChoices}
                        sx={{ height: 38 }}
                    />
                )}
                {!isLeagueOnlyTab && scope === 'team' && teams.length > 0 && (
                    <TeamFilterPill
                        value={team}
                        onChange={setTeam}
                        teams={teams.map((entry) => entry.name)}
                        allValue=""
                        allLabel="Choose a team"
                    />
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!isLeagueOnlyTab && scope === 'conference' && (
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: 2, fontWeight: 700 }}>
                    {conferenceLabel(conference)} records
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : categoryRows.length === 0 ? (
                <Box sx={{ color: 'var(--text-muted)', py: 6, textAlign: 'center' }}>No records yet for this view.</Box>
            ) : (
                <>
                    <Panel header={activeCategory} more={`${categoryRows.length}`}>
                        <Box ref={fitRef}>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                    columnGap: '16px',
                                }}
                            >
                                {[
                                    pageRows.slice(0, Math.ceil(pageRows.length / 2)),
                                    pageRows.slice(Math.ceil(pageRows.length / 2)),
                                ].map((column, index) => (
                                    <Box key={index}>
                                        {column.map((record) => (
                                            <RecordRow
                                                key={`${record.record_name}-${record.record_type}`}
                                                record={record}
                                                teamsMap={teamsMap}
                                            />
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                            <PagedFooter
                                page={page}
                                pageCount={pageCount}
                                pageSize={pageSize}
                                total={categoryRows.length}
                                onChange={setPage}
                                noun="records"
                            />
                        </Box>
                    </Panel>
                    {activeTab === 'single_season' && (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.72rem', mt: 1.25 }}>
                            *Percentage and per play records require a minimum number of attempts per stat
                        </Box>
                    )}
                </>
            )}
        </PageWrap>
    );
};

RecordsBoard.propTypes = { user: PropTypes.object };

export default RecordsBoard;
