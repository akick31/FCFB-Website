import { useEffect, useState } from 'react';
import { getCountries } from '../api/stadiumApi';
import { DEFAULT_COUNTRY } from '../components/stadium/countries';

let cached = null;
let inflight = null;

const load = () => {
    if (!inflight) {
        inflight = getCountries()
            .then((countries) => {
                cached = countries;
                return countries;
            })
            .finally(() => {
                inflight = null;
            });
    }
    return inflight;
};

export const useCountries = () => {
    const [countries, setCountries] = useState(cached || [DEFAULT_COUNTRY]);

    useEffect(() => {
        if (cached) {
            return undefined;
        }
        let active = true;
        load()
            .then((loaded) => active && setCountries(loaded))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    return countries;
};
