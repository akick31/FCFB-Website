import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendRoot } from '../../api/apiDocsApi';
import { seasonHasStarted } from '../../utils/statsCatalog';

const RECENT_GAMES_LIMIT = 100;
const EMPTY_LOOKUPS = {
    rawTeams: [],
    seasons: [],
    users: [],
    games: [],
    ongoingGames: [],
    newSignups: [],
    scenarios: [],
    scheduleEntries: [],
    conferences: [],
    currentSeasonNumber: null,
    currentWeekNumber: null,
};
const needsLookup = (parameters, names) => parameters.some((parameter) => names.includes(parameter.name.toLowerCase()));
const docsGet = (apiKey, path, params) =>
    axios
        .get(`${backendRoot}/api/v1/arceus${path}`, {
            params,
            headers: { ...(apiKey ? { 'X-Api-Key': apiKey } : {}), 'X-Client-Name': 'fcfb-website' },
        })
        .then((response) => response.data);

export const useApiExplorerLookups = (operation, apiKey) => {
    const [state, setState] = useState({ key: apiKey, values: EMPTY_LOOKUPS });
    const lookups = state.key === apiKey ? state.values : EMPTY_LOOKUPS;

    useEffect(() => {
        let active = true;
        setState({ key: apiKey, values: EMPTY_LOOKUPS });
        const update = (values) => {
            if (active) {
                setState((current) =>
                    current.key === apiKey ? { key: apiKey, values: { ...current.values, ...values } } : current
                );
            }
        };
        docsGet(apiKey, '/season/all')
            .then(async (all) => {
                if (!active) {
                    return;
                }
                const started = (all || [])
                    .filter(seasonHasStarted)
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null)
                    .sort((a, b) => b - a);
                update({ seasons: started });
                try {
                    const season = await docsGet(apiKey, '/season/current');
                    update({ currentSeasonNumber: season?.season_number });
                } catch {
                    update({ currentSeasonNumber: started[0] });
                }
            })
            .catch(() => {});
        const resources = [
            ['users', '/user/all'],
            ['rawTeams', '/team/all'],
            ['conferences', '/conference'],
            ['games', '/game', { category: 'PAST', sort: 'NEWEST', page: 0, size: RECENT_GAMES_LIMIT }],
            ['currentWeekNumber', '/season/current/week'],
        ];
        resources.forEach(([key, path, params]) => {
            docsGet(apiKey, path, params)
                .then((value) =>
                    update({
                        [key]: key === 'games' ? value?.content || [] : key === 'conferences' ? value || [] : value,
                    })
                )
                .catch(() => {});
        });
        return () => {
            active = false;
        };
    }, [apiKey]);

    useEffect(() => {
        let active = true;
        const update = (key, value) => {
            if (active) {
                setState((current) =>
                    current.key === apiKey ? { key: apiKey, values: { ...current.values, [key]: value } } : current
                );
            }
        };
        const load = (key, path, params, pageable = false) => {
            docsGet(apiKey, path, params)
                .then((value) => update(key, pageable ? value?.content || [] : value))
                .catch(() => {});
        };
        const needsOngoingId = operation.path.endsWith('/game/ongoing') && needsLookup(operation.parameters, ['id']);
        if (
            !lookups.ongoingGames.length &&
            (needsLookup(operation.parameters, ['channelid', 'platformid']) || needsOngoingId)
        ) {
            load('ongoingGames', '/game', { category: 'ONGOING', page: 0, size: RECENT_GAMES_LIMIT }, true);
        }
        if (!lookups.newSignups.length && needsLookup(operation.parameters, ['newsignupid'])) {
            load('newSignups', '/new_signups');
        }
        if (!lookups.scenarios.length && needsLookup(operation.parameters, ['scenario'])) {
            load('scenarios', '/game_writeup/scenarios');
        }
        if (
            !lookups.scheduleEntries.length &&
            operation.path.includes('/schedule') &&
            needsLookup(operation.parameters, ['id']) &&
            lookups.currentSeasonNumber != null
        ) {
            load('scheduleEntries', '/schedule/season', { season: lookups.currentSeasonNumber });
        }
        return () => {
            active = false;
        };
    }, [operation, lookups.currentSeasonNumber, apiKey]);

    return lookups;
};
