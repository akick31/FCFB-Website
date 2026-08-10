import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import axios from 'axios';
import { backendRoot } from '../../api/apiDocsApi';
import { seasonHasStarted } from '../../utils/statsCatalog';
import { paramConfig, PAGE_SIZE_PRESETS } from '../../utils/apiDocsParamConfig';
import { humanizeParamName } from '../../utils/humanize';
import { MethodBadge } from './OperationList';
import SearchableSelect from './SearchableSelect';
import JsonViewer from './JsonViewer';

const RECENT_GAMES_LIMIT = 100;

const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '8px', font: 'inherit', fontSize: '0.82rem' };
const labelSx = { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' };
const sendBtnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', py: '9px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };

const needsLookup = (parameters, names) => parameters.some((p) => names.includes(p.name.toLowerCase()));

const parseJsonOrText = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const API_PREFIX = '/api/v1/arceus';

const docsGet = (apiKey, path, params) =>
    axios
        .get(`${backendRoot}${API_PREFIX}${path}`, {
            params,
            headers: { 'X-Api-Key': apiKey, 'X-Client-Name': 'fcfb-website' },
        })
        .then((res) => res.data);

const ParamInput = ({ param, value, onChange, config }) => {
    const displayLabel = config.label || humanizeParamName(param.name);
    return (
        <Box>
            <Box sx={{ ...labelSx, mb: '4px' }}>{displayLabel}{param.required && ' *'}</Box>
            {config.uiType === 'select' ? (
                <Box component="select" sx={inputSx} value={value} onChange={(e) => onChange(e.target.value)}>
                    <option value="">Select...</option>
                    {config.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Box>
            ) : config.uiType === 'multiselect' ? (
                <Box
                    component="select"
                    multiple
                    sx={{ ...inputSx, height: `${Math.min(config.options.length, 5) * 28 + 16}px` }}
                    value={value}
                    onChange={(e) => onChange(Array.from(e.target.selectedOptions, (option) => option.value))}
                >
                    {config.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Box>
            ) : config.uiType === 'search' ? (
                <SearchableSelect id={`dl-${param.name}`} value={value} onChange={onChange} options={config.options} placeholder={`Search ${displayLabel.toLowerCase()}...`} />
            ) : config.uiType === 'pageable' ? (
                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '0 0 90px' }}>
                        <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Page</Box>
                        <Box component="input" type="number" min={0} sx={inputSx} value={value.page} onChange={(e) => onChange({ ...value, page: e.target.value })} />
                    </Box>
                    <Box sx={{ flex: '0 0 110px' }}>
                        <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Page size</Box>
                        <Box component="select" sx={inputSx} value={value.size} onChange={(e) => onChange({ ...value, size: e.target.value })}>
                            {PAGE_SIZE_PRESETS.map((size) => <option key={size} value={size}>{size}</option>)}
                        </Box>
                    </Box>
                    {config.sortFieldOptions && (
                        <>
                            <Box sx={{ flex: '0 0 140px' }}>
                                <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Sort by</Box>
                                <Box component="select" sx={inputSx} value={value.sortField} onChange={(e) => onChange({ ...value, sortField: e.target.value })}>
                                    <option value="">(default order)</option>
                                    {config.sortFieldOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </Box>
                            </Box>
                            <Box sx={{ flex: '0 0 130px' }}>
                                <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Direction</Box>
                                <Box component="select" sx={inputSx} value={value.sortDirection} onChange={(e) => onChange({ ...value, sortDirection: e.target.value })}>
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            ) : (
                <Box component="input" sx={inputSx} value={value} onChange={(e) => onChange(e.target.value)} />
            )}
        </Box>
    );
};

ParamInput.propTypes = {
    param: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]).isRequired,
    onChange: PropTypes.func.isRequired,
    config: PropTypes.shape({
        uiType: PropTypes.oneOf(['select', 'multiselect', 'search', 'text', 'pageable']).isRequired,
        label: PropTypes.string,
        options: PropTypes.array,
    }).isRequired,
};

const ParamGroup = ({ title, params, paramValues, setParamValues, lookups, operationPath }) => {
    if (params.length === 0) return null;
    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ ...labelSx, mb: '8px' }}>{title}</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {params.map((p) => {
                    const config = paramConfig(p, lookups, paramValues, operationPath);
                    const fallback = config.uiType === 'multiselect' ? [] : config.uiType === 'pageable' ? { page: 0, size: 20, sortField: '', sortDirection: 'asc' } : '';
                    return (
                        <ParamInput
                            key={p.name}
                            param={p}
                            value={paramValues[p.name] || fallback}
                            onChange={(val) => setParamValues((v) => ({ ...v, [p.name]: val }))}
                            config={config}
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

ParamGroup.propTypes = {
    title: PropTypes.string.isRequired,
    params: PropTypes.array.isRequired,
    paramValues: PropTypes.object.isRequired,
    setParamValues: PropTypes.func.isRequired,
    lookups: PropTypes.object.isRequired,
    operationPath: PropTypes.string.isRequired,
};

const OperationDetail = ({ operation, apiKey }) => {
    const [paramValues, setParamValues] = useState({});
    const [bodyText, setBodyText] = useState('');
    const [file, setFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');
    const [response, setResponse] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [users, setUsers] = useState([]);
    const [games, setGames] = useState([]);
    const [rawTeams, setRawTeams] = useState([]);
    const [ongoingGames, setOngoingGames] = useState([]);
    const [newSignups, setNewSignups] = useState([]);
    const [scenarios, setScenarios] = useState([]);
    const [scheduleEntries, setScheduleEntries] = useState([]);
    const [conferences, setConferences] = useState([]);
    const [currentSeasonNumber, setCurrentSeasonNumber] = useState(null);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (!response?.imageBlob) {
            setImageUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(response.imageBlob);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [response]);

    useEffect(() => {
        if (!apiKey) return;
        docsGet(apiKey, '/season/all')
            .then((all) => {
                const started = (all || [])
                    .filter(seasonHasStarted)
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null)
                    .sort((a, b) => b - a);
                setSeasons(started);
                return started;
            })
            .then((started) => {
                docsGet(apiKey, '/season/current')
                    .then((season) => setCurrentSeasonNumber(season?.season_number))
                    .catch(() => setCurrentSeasonNumber(started[0]));
            })
            .catch(() => {});
        docsGet(apiKey, '/user/all').then(setUsers).catch(() => {});
        docsGet(apiKey, '/team/all').then(setRawTeams).catch(() => {});
        docsGet(apiKey, '/conference').then((all) => setConferences(all || [])).catch(() => {});
        docsGet(apiKey, '/game', { category: 'PAST', sort: 'NEWEST', page: 0, size: RECENT_GAMES_LIMIT })
            .then((page) => setGames(page?.content || []))
            .catch(() => {});
        docsGet(apiKey, '/season/current/week')
            .then((week) => setCurrentWeekNumber(week))
            .catch(() => {});
    }, [apiKey]);

    useEffect(() => {
        setParamValues({});
        setBodyText(operation.requestBody ? '{}' : '');
        setFile(null);
        setFormError('');
        setResponse(null);
    }, [operation.id]);

    useEffect(() => {
        if (!apiKey) return;
        const needsOngoingGameId = operation.path.endsWith('/game/ongoing') && needsLookup(operation.parameters, ['id']);
        if (ongoingGames.length === 0 && (needsLookup(operation.parameters, ['channelid', 'platformid']) || needsOngoingGameId)) {
            docsGet(apiKey, '/game', { category: 'ONGOING', page: 0, size: RECENT_GAMES_LIMIT })
                .then((page) => setOngoingGames(page?.content || []))
                .catch(() => {});
        }
        if (newSignups.length === 0 && needsLookup(operation.parameters, ['newsignupid'])) {
            docsGet(apiKey, '/new_signups').then(setNewSignups).catch(() => {});
        }
        if (scenarios.length === 0 && needsLookup(operation.parameters, ['scenario'])) {
            docsGet(apiKey, '/game_writeup/scenarios').then(setScenarios).catch(() => {});
        }
        const needsScheduleEntryId = operation.path.includes('/schedule') && needsLookup(operation.parameters, ['id']);
        if (scheduleEntries.length === 0 && needsScheduleEntryId && currentSeasonNumber != null) {
            docsGet(apiKey, '/schedule/season', { season: currentSeasonNumber }).then(setScheduleEntries).catch(() => {});
        }
    }, [operation, currentSeasonNumber, apiKey]);

    const lookups = useMemo(
        () => ({
            rawTeams,
            seasons,
            users,
            games,
            ongoingGames,
            newSignups,
            scenarios,
            scheduleEntries,
            conferences,
            currentSeasonNumber,
            currentWeekNumber,
        }),
        [rawTeams, seasons, users, games, ongoingGames, newSignups, scenarios, scheduleEntries, conferences, currentSeasonNumber, currentWeekNumber],
    );

    const pathParams = useMemo(() => operation.parameters.filter((p) => p.in === 'path'), [operation]);
    const queryParams = useMemo(() => operation.parameters.filter((p) => p.in === 'query'), [operation]);

    const send = async () => {
        setFormError('');
        const missing = pathParams.filter((p) => !paramValues[p.name]);
        if (missing.length > 0) {
            setFormError(`Missing required parameter: ${missing.map((p) => paramConfig(p, lookups, paramValues, operation.path).label || humanizeParamName(p.name)).join(', ')}`);
            return;
        }
        if (operation.fileField && !file) {
            setFormError('Choose a file to upload');
            return;
        }

        let resolvedPath = operation.path;
        pathParams.forEach((p) => {
            const config = paramConfig(p, lookups, paramValues, operation.path);
            const resolved = config.resolve ? config.resolve(paramValues[p.name]) : paramValues[p.name];
            resolvedPath = resolvedPath.replace(`{${p.name}}`, encodeURIComponent(resolved));
        });

        const params = {};
        queryParams.forEach((p) => {
            const value = paramValues[p.name];
            const config = paramConfig(p, lookups, paramValues, operation.path);
            if (config.uiType === 'pageable') {
                const pageable = value || {};
                if (pageable.page !== undefined && pageable.page !== '') params.page = pageable.page;
                if (pageable.size !== undefined && pageable.size !== '') params.size = pageable.size;
                if (pageable.sortField) params.sort = `${pageable.sortField},${pageable.sortDirection || 'asc'}`;
                return;
            }
            if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return;
            params[p.name] = config.resolve ? config.resolve(value) : value;
        });

        let data;
        if (operation.fileField) {
            data = new FormData();
            data.append(operation.fileField, file);
        } else if (operation.requestBody) {
            try {
                data = bodyText ? JSON.parse(bodyText) : {};
            } catch {
                setFormError('Request body is not valid JSON');
                return;
            }
        }

        setSending(true);
        setResponse(null);
        try {
            const res = await axios.request({
                method: operation.method,
                url: `${backendRoot}${resolvedPath}`,
                params,
                data,
                headers: { 'X-Api-Key': apiKey, 'X-Client-Name': 'fcfb-website' },
                responseType: operation.binaryResponse ? 'blob' : 'json',
            });
            if (operation.binaryResponse && res.data instanceof Blob) {
                setResponse({ status: res.status, imageBlob: res.data });
            } else {
                setResponse({ status: res.status, data: res.data });
            }
        } catch (err) {
            if (err.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                setResponse({ status: err.response.status, data: parseJsonOrText(text) });
            } else {
                setResponse({ status: err.response?.status, data: err.response?.data ?? err.message });
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MethodBadge method={operation.method} />
                <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{operation.path}</Box>
            </Box>

            {!apiKey && <Alert severity="info" sx={{ mb: 2 }}>Enter your API key above to send live requests.</Alert>}

            <ParamGroup title="Path parameters" params={pathParams} paramValues={paramValues} setParamValues={setParamValues} lookups={lookups} operationPath={operation.path} />
            <ParamGroup title="Query parameters" params={queryParams} paramValues={paramValues} setParamValues={setParamValues} lookups={lookups} operationPath={operation.path} />

            {operation.fileField && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>File</Box>
                    <Box component="input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} sx={{ ...inputSx, py: '7px' }} />
                </Box>
            )}

            {operation.requestBody && !operation.fileField && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Request body (JSON)</Box>
                    <Box
                        component="textarea"
                        rows={6}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        sx={{ ...inputSx, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', resize: 'vertical' }}
                    />
                </Box>
            )}

            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

            <Box component="button" onClick={send} disabled={!apiKey || sending} sx={sendBtnSx}>
                {sending ? 'Sending…' : 'Send request'}
            </Box>

            {response && (
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Response{response.status ? ` (${response.status})` : ''}</Box>
                    {imageUrl ? (
                        <Box component="img" src={imageUrl} alt="Response" sx={{ maxWidth: '100%', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }} />
                    ) : (
                        <JsonViewer value={response.data} />
                    )}
                </Box>
            )}
        </Box>
    );
};

OperationDetail.propTypes = {
    operation: PropTypes.shape({
        id: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        method: PropTypes.string.isRequired,
        summary: PropTypes.string.isRequired,
        parameters: PropTypes.array.isRequired,
        requestBody: PropTypes.object,
        fileField: PropTypes.string,
        binaryResponse: PropTypes.bool,
    }).isRequired,
    apiKey: PropTypes.string.isRequired,
};

export default OperationDetail;
