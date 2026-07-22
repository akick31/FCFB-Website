import { useEffect, useState } from 'react';
import { getAllTeams, getTeamByName } from '../api/teamApi';

const toDarkLogo = (logo) =>
    logo && logo.includes('/500/') ? logo.replace('/500/', '/500-dark/') : logo;

const toEntry = (team) => ({
    name: team.name,
    abbreviation: team.abbreviation || team.name.slice(0, 4).toUpperCase(),
    logo: team.logo || null,
    logoDark: toDarkLogo(team.logo),
    primaryColor: team.primary_color || '#004260',
    secondaryColor: team.secondary_color || '#888888',
    conference: team.conference || null,
});

let bulk = null;
let bulkInflight = null;
const lazy = {};
const lazyInflight = {};
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const loadBulk = () => {
    if (bulk || bulkInflight) return;
    bulkInflight = getAllTeams()
        .then((teams) => {
            const map = {};
            for (const team of teams || []) {
                if (team?.name) map[team.name] = toEntry(team);
            }
            bulk = map;
            notify();
        })
        .catch(() => {
            bulkInflight = null;
        });
};

export const ensureTeam = (name) => {
    if (!name || lazy[name] || lazyInflight[name] || (bulk && bulk[name])) return;
    lazyInflight[name] = getTeamByName(name)
        .then((team) => {
            if (team?.name) lazy[name] = toEntry(team);
        })
        .catch(() => {})
        .finally(() => {
            delete lazyInflight[name];
            notify();
        });
};

const mergedMap = () => ({ ...(bulk || {}), ...lazy });

export const useTeamsMap = () => {
    const [, setVersion] = useState(0);

    useEffect(() => {
        loadBulk();
        const listener = () => setVersion((version) => version + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    return mergedMap();
};
