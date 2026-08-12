import { useEffect, useState } from 'react';
import { getAllVenues } from '../api/venueApi';

let bulk = null;
let bulkInflight = null;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const loadBulk = () => {
    if (bulk || bulkInflight) return;
    bulkInflight = getAllVenues()
        .then((venues) => {
            const map = {};
            for (const venue of venues || []) {
                if (venue?.name) map[venue.name] = venue;
            }
            bulk = map;
            notify();
        })
        .catch(() => {
            bulkInflight = null;
        });
};

export const useVenuesMap = () => {
    const [, setVersion] = useState(0);

    useEffect(() => {
        loadBulk();
        const listener = () => setVersion((version) => version + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    return bulk || {};
};
