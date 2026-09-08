import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SearchableSelect from '../../components/ui/SearchableSelect';
import DataTable from '../../components/ui/DataTable';
import { getAllUsers, getUserById, updateScoutingReportHiddenColumns } from '../../api/userApi';
import { getAllPlaysByDiscordId } from '../../api/playApi';
import { getGamesByIds } from '../../api/gameApi';
import { getCurrentSeason } from '../../api/seasonApi';
import { humanizeEnumValue } from '../../utils/humanize';
import {
    DOWN_OPTIONS,
    PLAY_TYPE_OPTIONS,
    SIDE_OPTIONS,
    FIELD_POSITION_OPTIONS,
    TEMPO_OPTIONS,
    PLAY_COLUMNS,
    CUSTOM_FIELD_CATALOG,
    OPERATORS_BY_TYPE,
    orderedGameIdsFromPlays,
    orderGameIdsByRecency,
    applyScenarioFilters,
    encodeHiddenColumns,
    decodeHiddenColumns,
    playsToCsv,
    downloadCsv,
} from '../../utils/scoutingReport';
import { useSeo } from '../../hooks/useSeo';

const ARRAY_PARAMS = { sides: 'sides', downs: 'downs', fieldPositions: 'fp', playTypes: 'types', tempo: 'tempo' };
const parseIntArray = (value) => (value ? value.split(',').map(Number).filter((n) => !Number.isNaN(n)) : []);
const parseStringArray = (value) => (value ? value.split(',').filter(Boolean) : []);

const userLabel = (user) => (user.team ? `${user.username} (${user.team})` : user.username);

const CONTROL_HEIGHT = '34px';

const inputSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: 0, font: 'inherit', fontSize: '0.8rem', '&:disabled': { opacity: 0.5 } };
const btnSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };
const ghostBtnSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', font: 'inherit', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' };
const stepBtnSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', width: '30px', font: 'inherit', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:disabled': { opacity: 0.4, cursor: 'not-allowed' } };
const labelSx = { fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' };

const chipSx = (active) => ({
    border: '1px solid',
    borderColor: active ? 'var(--brand)' : 'var(--line)',
    background: active ? 'color-mix(in srgb, var(--brand) 16%, var(--surface))' : 'var(--surface-2)',
    color: active ? 'var(--brand)' : 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    py: '5px',
    font: 'inherit',
    fontSize: '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
});

const Chip = ({ active, onClick, children }) => (
    <Box component="button" type="button" onClick={onClick} sx={chipSx(active)}>{children}</Box>
);

Chip.propTypes = {
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

const toggleInArray = (array, value) => (array.includes(value) ? array.filter((entry) => entry !== value) : [...array, value]);

const ScoutingReport = () => {
    useSeo({ title: 'Scouting Report | Fake College Football', description: 'Pull every play for a coach and filter by scenario.' });

    const [searchParams, setSearchParams] = useSearchParams();
    const autoRanRef = useRef(false);
    const loggedInUserId = localStorage.getItem('userId');

    const [users, setUsers] = useState([]);
    const [currentSeasonNumber, setCurrentSeasonNumber] = useState(null);
    const [loadingLookups, setLoadingLookups] = useState(true);

    const [targetLabel, setTargetLabel] = useState('');
    const [gameCount, setGameCount] = useState(10);
    const [rangeMode, setRangeMode] = useState('count');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasGenerated, setHasGenerated] = useState(false);
    const [plays, setPlays] = useState([]);
    const [reportTarget, setReportTarget] = useState(null);

    const [sides, setSides] = useState([]);
    const [downs, setDowns] = useState([]);
    const [fieldPositions, setFieldPositions] = useState([]);
    const [playTypes, setPlayTypes] = useState([]);
    const [tempo, setTempo] = useState([]);
    const [customFilters, setCustomFilters] = useState([]);
    const [hiddenColumns, setHiddenColumns] = useState([]);
    const [columnsOpen, setColumnsOpen] = useState(true);
    const [savingColumns, setSavingColumns] = useState(false);
    const nextFilterId = useRef(0);

    useEffect(() => {
        const urlCols = searchParams.get('cols');
        Promise.all([
            getAllUsers().catch(() => []),
            getCurrentSeason().catch(() => null),
            loggedInUserId ? getUserById(loggedInUserId).catch(() => null) : Promise.resolve(null),
        ])
            .then(([allUsers, current, currentUser]) => {
                setUsers(allUsers || []);
                setCurrentSeasonNumber(current?.season_number ?? null);
                if (urlCols) {
                    setHiddenColumns(decodeHiddenColumns(urlCols));
                } else if (currentUser?.scouting_report_hidden_columns) {
                    setHiddenColumns(currentUser.scouting_report_hidden_columns);
                }
            })
            .finally(() => setLoadingLookups(false));
    }, []);

    const targetOptions = useMemo(
        () => users.filter((user) => user.discord_id).map((user) => ({ value: user.discord_id, label: userLabel(user) })).sort((a, b) => a.label.localeCompare(b.label)),
        [users],
    );

    const resolvedTarget = useMemo(() => targetOptions.find((option) => option.label === targetLabel)?.value ?? null, [targetOptions, targetLabel]);

    const generate = async (overrideTarget = resolvedTarget, overrideGameCount = gameCount, overrideRangeMode = rangeMode, resetFilters = true) => {
        if (!overrideTarget) {
            setError('Pick a coach or team first.');
            return;
        }
        const overrideUser = users.find((user) => user.discord_id === overrideTarget) || null;
        setLoading(true);
        setError('');
        try {
            const rawPlays = await getAllPlaysByDiscordId(overrideTarget);
            const allGameIds = orderedGameIdsFromPlays(rawPlays);
            const games = await getGamesByIds(allGameIds);
            const map = {};
            (games || []).forEach((game) => { map[game.game_id] = game; });
            const rankedGameIds = orderGameIdsByRecency(allGameIds, map, overrideUser?.team);
            const selectedGameIds = overrideRangeMode === 'season'
                ? rankedGameIds.filter((id) => map[id]?.season === currentSeasonNumber)
                : rankedGameIds.slice(0, overrideGameCount);
            const allowedIds = new Set(selectedGameIds);
            const limited = rawPlays.filter((play) => allowedIds.has(play.game_id));

            setPlays(limited);
            setReportTarget(overrideTarget);
            setHasGenerated(true);
            if (resetFilters) {
                setSides([]);
                setDowns([]);
                setFieldPositions([]);
                setPlayTypes([]);
                setTempo([]);
                setCustomFilters([]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetOptions.length === 0 || autoRanRef.current) return;
        autoRanRef.current = true;
        const urlCoach = searchParams.get('coach');
        const option = targetOptions.find((entry) => entry.value === urlCoach);
        if (!option) return;
        setTargetLabel(option.label);

        const urlGames = Number(searchParams.get('games'));
        const urlSeason = searchParams.get('season') === '1';
        const urlSides = parseStringArray(searchParams.get(ARRAY_PARAMS.sides));
        const urlDowns = parseIntArray(searchParams.get(ARRAY_PARAMS.downs));
        const urlFieldPositions = parseStringArray(searchParams.get(ARRAY_PARAMS.fieldPositions));
        const urlPlayTypes = parseStringArray(searchParams.get(ARRAY_PARAMS.playTypes));
        const urlTempo = parseStringArray(searchParams.get(ARRAY_PARAMS.tempo));

        const resolvedGameCount = urlGames > 0 ? urlGames : gameCount;
        const resolvedRangeMode = urlSeason ? 'season' : 'count';
        setGameCount(resolvedGameCount);
        setRangeMode(resolvedRangeMode);
        setSides(urlSides);
        setDowns(urlDowns);
        setFieldPositions(urlFieldPositions);
        setPlayTypes(urlPlayTypes);
        setTempo(urlTempo);

        generate(option.value, resolvedGameCount, resolvedRangeMode, false);
    }, [targetOptions]);

    useEffect(() => {
        if (!hasGenerated || !reportTarget) return;
        const next = new URLSearchParams(searchParams);
        next.set('coach', reportTarget);
        next.set('games', String(gameCount));
        if (rangeMode === 'season') next.set('season', '1'); else next.delete('season');
        const setOrDelete = (key, values) => { if (values.length) next.set(key, values.join(',')); else next.delete(key); };
        setOrDelete(ARRAY_PARAMS.sides, sides);
        setOrDelete(ARRAY_PARAMS.downs, downs);
        setOrDelete(ARRAY_PARAMS.fieldPositions, fieldPositions);
        setOrDelete(ARRAY_PARAMS.playTypes, playTypes);
        setOrDelete(ARRAY_PARAMS.tempo, tempo);
        const colsEncoded = encodeHiddenColumns(hiddenColumns);
        if (colsEncoded) next.set('cols', colsEncoded); else next.delete('cols');
        setSearchParams(next, { replace: true });
    }, [reportTarget, gameCount, rangeMode, sides, downs, fieldPositions, playTypes, tempo, hiddenColumns, hasGenerated]);

    const toggleColumn = (column) => setHiddenColumns((prev) => toggleInArray(prev, column));
    const saveColumns = async () => {
        if (!loggedInUserId) return;
        setSavingColumns(true);
        try {
            await updateScoutingReportHiddenColumns(loggedInUserId, hiddenColumns);
        } finally {
            setSavingColumns(false);
        }
    };

    const visibleColumns = useMemo(() => PLAY_COLUMNS.filter((column) => !hiddenColumns.includes(column)), [hiddenColumns]);

    const filteredPlays = useMemo(
        () => applyScenarioFilters(plays, { mode: 'coach', target: reportTarget, sides, downs, fieldPositions, playTypes, tempo, customFilters }),
        [plays, reportTarget, sides, downs, fieldPositions, playTypes, tempo, customFilters],
    );

    const addCustomFilter = () => {
        const field = CUSTOM_FIELD_CATALOG[0];
        setCustomFilters((prev) => [...prev, { id: nextFilterId.current++, field: field.key, operator: OPERATORS_BY_TYPE[field.type][0].value, value: '' }]);
    };
    const updateCustomFilter = (id, patch) => setCustomFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter)));
    const removeCustomFilter = (id) => setCustomFilters((prev) => prev.filter((filter) => filter.id !== id));

    const exportCsv = () => downloadCsv(`scouting-report-${reportTarget || 'report'}.csv`, playsToCsv(filteredPlays, visibleColumns));

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Scouting Report" />

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Coach or team</Box>
                            {loadingLookups ? (
                                <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box>
                            ) : (
                                <SearchableSelect
                                    id="scouting-target"
                                    value={targetLabel}
                                    onChange={setTargetLabel}
                                    options={targetOptions}
                                    placeholder="Search by coach username or team…"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Games</Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Box component="button" type="button" onClick={() => setGameCount((n) => Math.max(1, n - 1))} disabled={rangeMode === 'season' || gameCount <= 1} sx={stepBtnSx}>−</Box>
                                <Box
                                    component="input"
                                    type="number"
                                    min={1}
                                    value={gameCount}
                                    disabled={rangeMode === 'season'}
                                    onChange={(event) => setGameCount(Math.max(1, Math.floor(Number(event.target.value)) || 1))}
                                    sx={{ ...inputSx, width: '64px', textAlign: 'center' }}
                                />
                                <Box component="button" type="button" onClick={() => setGameCount((n) => n + 1)} disabled={rangeMode === 'season'} sx={stepBtnSx}>+</Box>
                            </Box>
                        </Box>
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>&nbsp;</Box>
                            <Box
                                component="label"
                                sx={{ display: 'flex', alignItems: 'center', gap: '8px', height: CONTROL_HEIGHT, cursor: 'pointer' }}
                            >
                                <Box
                                    component="input"
                                    type="checkbox"
                                    checked={rangeMode === 'season'}
                                    onChange={(event) => setRangeMode(event.target.checked ? 'season' : 'count')}
                                />
                                <Box component="span" sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>Current season only</Box>
                            </Box>
                        </Box>
                        <Box component="button" type="button" onClick={() => generate()} disabled={loading || !resolvedTarget} sx={btnSx}>
                            {loading ? 'Generating…' : 'Generate report'}
                        </Box>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Panel>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            )}

            {!loading && hasGenerated && (
                <>
                    <Panel sx={{ mb: '16px' }}>
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <Box>
                                <Box sx={{ ...labelSx, mb: '8px' }}>Side</Box>
                                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {SIDE_OPTIONS.map((option) => (
                                        <Chip key={option.value} active={sides.includes(option.value)} onClick={() => setSides((prev) => toggleInArray(prev, option.value))}>{option.label}</Chip>
                                    ))}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ ...labelSx, mb: '8px' }}>Down</Box>
                                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {DOWN_OPTIONS.map((option) => (
                                        <Chip key={option.value} active={downs.includes(option.value)} onClick={() => setDowns((prev) => toggleInArray(prev, option.value))}>{option.label}</Chip>
                                    ))}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ ...labelSx, mb: '8px' }}>Field position</Box>
                                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {FIELD_POSITION_OPTIONS.map((option) => (
                                        <Chip key={option.value} active={fieldPositions.includes(option.value)} onClick={() => setFieldPositions((prev) => toggleInArray(prev, option.value))}>{option.label}</Chip>
                                    ))}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ ...labelSx, mb: '8px' }}>Play type</Box>
                                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {PLAY_TYPE_OPTIONS.map((option) => (
                                        <Chip key={option.value} active={playTypes.includes(option.value)} onClick={() => setPlayTypes((prev) => toggleInArray(prev, option.value))}>{option.label}</Chip>
                                    ))}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ ...labelSx, mb: '8px' }}>Tempo</Box>
                                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {TEMPO_OPTIONS.map((option) => (
                                        <Chip key={option.value} active={tempo.includes(option.value)} onClick={() => setTempo((prev) => toggleInArray(prev, option.value))}>{option.label}</Chip>
                                    ))}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
                                    <Box sx={labelSx}>Custom filters</Box>
                                    <Box component="button" type="button" onClick={addCustomFilter} sx={ghostBtnSx}>+ Add filter</Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {customFilters.map((filter) => {
                                        const field = CUSTOM_FIELD_CATALOG.find((entry) => entry.key === filter.field);
                                        return (
                                            <Box key={filter.id} sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <Box
                                                    component="select"
                                                    sx={inputSx}
                                                    value={filter.field}
                                                    onChange={(event) => {
                                                        const nextField = CUSTOM_FIELD_CATALOG.find((entry) => entry.key === event.target.value);
                                                        updateCustomFilter(filter.id, { field: nextField.key, operator: OPERATORS_BY_TYPE[nextField.type][0].value, value: '' });
                                                    }}
                                                >
                                                    {CUSTOM_FIELD_CATALOG.map((entry) => <option key={entry.key} value={entry.key}>{entry.label}</option>)}
                                                </Box>
                                                <Box component="select" sx={inputSx} value={filter.operator} onChange={(event) => updateCustomFilter(filter.id, { operator: event.target.value })}>
                                                    {OPERATORS_BY_TYPE[field.type].map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                                                </Box>
                                                {field.type === 'enum' ? (
                                                    <Box component="select" sx={inputSx} value={filter.value} onChange={(event) => updateCustomFilter(filter.id, { value: event.target.value })}>
                                                        <option value="">Select…</option>
                                                        {field.options.map((option) => <option key={option} value={option}>{humanizeEnumValue(option)}</option>)}
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        component="input"
                                                        type={field.type === 'number' ? 'number' : 'text'}
                                                        sx={inputSx}
                                                        value={filter.value}
                                                        onChange={(event) => updateCustomFilter(filter.id, { value: event.target.value })}
                                                    />
                                                )}
                                                <Box component="button" type="button" onClick={() => removeCustomFilter(filter.id)} sx={{ ...ghostBtnSx, px: '10px' }}>Remove</Box>
                                            </Box>
                                        );
                                    })}
                                    {customFilters.length === 0 && <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>No custom filters added.</Box>}
                                </Box>
                            </Box>
                        </Box>
                    </Panel>

                    <SectionTitle title="Columns" collapsible collapsed={!columnsOpen} onToggle={() => setColumnsOpen((prev) => !prev)} note={`${visibleColumns.length} of ${PLAY_COLUMNS.length} shown`} />
                    {columnsOpen && (
                        <Panel sx={{ mb: '16px' }}>
                            <Box sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', gap: '8px', mb: '10px' }}>
                                    <Box component="button" type="button" onClick={() => setHiddenColumns([])} sx={ghostBtnSx}>Show all</Box>
                                    <Box component="button" type="button" onClick={() => setHiddenColumns([...PLAY_COLUMNS])} sx={ghostBtnSx}>Hide all</Box>
                                    <Box component="button" type="button" onClick={() => saveColumns()} disabled={savingColumns || !loggedInUserId} sx={ghostBtnSx}>
                                        {savingColumns ? 'Saving…' : 'Save as default'}
                                    </Box>
                                </Box>
                                <Box sx={{ columns: '180px', columnGap: '8px' }}>
                                    {PLAY_COLUMNS.map((column) => (
                                        <Box key={column} component="label" sx={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', breakInside: 'avoid', mb: '8px' }}>
                                            <Box component="input" type="checkbox" checked={!hiddenColumns.includes(column)} onChange={() => toggleColumn(column)} />
                                            <Box component="span" sx={{ fontSize: '0.78rem', color: 'var(--text)' }}>{column}</Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Panel>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '10px', flexWrap: 'wrap', gap: '10px' }}>
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing {filteredPlays.length} of {plays.length} plays</Box>
                        <Box component="button" type="button" onClick={exportCsv} disabled={filteredPlays.length === 0} sx={btnSx}>Export CSV</Box>
                    </Box>

                    {filteredPlays.length === 0 ? (
                        <Panel><Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No plays match these filters.</Box></Panel>
                    ) : (
                        <DataTable minWidth={2400}>
                            <thead>
                                <tr>
                                    {visibleColumns.map((column) => (
                                        <th key={column} className={`lft${column === 'play_id' ? ' stick' : ''}`}>{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlays.map((play) => (
                                    <tr key={play.play_id}>
                                        {visibleColumns.map((column) => {
                                            const value = play[column];
                                            const cell = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : (value ?? '');
                                            return (
                                                <td key={column} className={`lft${column === 'play_id' ? ' stick' : ''}`}>
                                                    {column === 'game_id' ? (
                                                        <Box component={Link} to={`/game-details/${play.game_id}`} sx={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 700 }}>{cell}</Box>
                                                    ) : cell}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>
                    )}
                </>
            )}
        </PageWrap>
    );
};

export default ScoutingReport;
