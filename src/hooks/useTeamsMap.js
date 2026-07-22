import { useEffect, useState } from 'react';
import { getAllTeams } from '../api/teamApi';

let cache = null;
let inflight = null;

const toDarkLogo = (logo) =>
    logo && logo.includes('/500/') ? logo.replace('/500/', '/500-dark/') : logo;

const buildMap = (teams) => {
    const map = {};
    for (const team of teams || []) {
        if (!team?.name) continue;
        map[team.name] = {
            name: team.name,
            abbreviation: team.abbreviation || team.name.slice(0, 4).toUpperCase(),
            logo: team.logo || null,
            logoDark: toDarkLogo(team.logo),
            primaryColor: team.primary_color || '#004260',
            secondaryColor: team.secondary_color || '#888888',
            conference: team.conference || null,
        };
    }
    return map;
};

export const getCachedTeamsMap = () => cache;

export const useTeamsMap = () => {
    const [map, setMap] = useState(cache || {});

    useEffect(() => {
        if (cache) return undefined;
        if (!inflight) inflight = getAllTeams().then(buildMap);

        let active = true;
        inflight
            .then((built) => {
                cache = built;
                if (active) setMap(built);
            })
            .catch(() => {
                inflight = null;
            });

        return () => {
            active = false;
        };
    }, []);

    return map;
};
