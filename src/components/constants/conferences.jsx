import { useEffect, useState } from 'react';
import { getConferences } from '../../api/conferenceApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';

let bulk = null;
let bulkInflight = null;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const loadBulk = () => {
    if (bulk || bulkInflight) return;
    bulkInflight = getConferences()
        .then((conferences) => {
            const map = {};
            for (const conference of conferences || []) {
                if (conference?.code) map[conference.code] = conference;
            }
            bulk = map;
            notify();
        })
        .catch(() => {
            bulkInflight = null;
        });
};

export const ensureConferences = () => loadBulk();

export const refreshConferences = () => {
    bulk = null;
    bulkInflight = null;
    loadBulk();
};

export const useConferencesMap = () => {
    const [, setVersion] = useState(0);

    useEffect(() => {
        loadBulk();
        const listener = () => setVersion((version) => version + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    return bulk || {};
};

export const getConference = (code) => (bulk && bulk[code]) || null;

export const conferenceLabel = (code) => getConference(code)?.label || code;

export const conferenceLogo = (code) => getConference(code)?.logo_url || null;

export const conferenceLogoDark = (code) => getConference(code)?.logo_url_dark || conferenceLogo(code);

export const activeConferenceList = () =>
    Object.values(bulk || {})
        .filter((conference) => conference.active)
        .sort((a, b) => (a.label || '').localeCompare(b.label || ''));

export const allConferenceList = () =>
    Object.values(bulk || {}).sort((a, b) => (a.label || '').localeCompare(b.label || ''));

export const activeConferenceCodes = () => activeConferenceList().map((conference) => conference.code);

export const useSeasonConferenceCodes = (season) => {
    const [codes, setCodes] = useState([]);

    useEffect(() => {
        if (season == null || season === 'all' || season === 'alltime') { setCodes([]); return undefined; }
        let active = true;
        getTeamSeasonConference(season).then((map) => {
            if (!active) return;
            setCodes([...new Set(Object.values(map || {}))].filter(Boolean));
        }).catch(() => { if (active) setCodes([]); });
        return () => { active = false; };
    }, [season]);

    return codes;
};

export const seasonConferenceList = (codes) => {
    const set = new Set(codes || []);
    return allConferenceList().filter((conference) => set.has(conference.code));
};
