import { useMemo, useRef, useState } from 'react';
import { humanizeEnumValue } from '../utils/humanize';
import {
    DOWN_OPTIONS,
    PLAY_TYPE_OPTIONS,
    SIDE_OPTIONS,
    FIELD_POSITION_OPTIONS,
    TEMPO_OPTIONS,
    CUSTOM_FIELD_CATALOG,
    OPERATORS_BY_TYPE,
} from '../utils/scoutingReport';

const useScoutingFilters = () => {
    const [sides, setSides] = useState([]);
    const [downs, setDowns] = useState([]);
    const [fieldPositions, setFieldPositions] = useState([]);
    const [playTypes, setPlayTypes] = useState([]);
    const [tempo, setTempo] = useState([]);
    const [customFilters, setCustomFilters] = useState([]);
    const nextFilterId = useRef(0);
    const filterSummary = useMemo(() => {
        const parts = [];
        const labelsFor = (values, options) =>
            values.map((value) => options.find((option) => option.value === value)?.label || value).join(', ');
        if (sides.length) {
            parts.push(`Side: ${labelsFor(sides, SIDE_OPTIONS)}`);
        }
        if (downs.length) {
            parts.push(`Down: ${labelsFor(downs, DOWN_OPTIONS)}`);
        }
        if (fieldPositions.length) {
            parts.push(`Field position: ${labelsFor(fieldPositions, FIELD_POSITION_OPTIONS)}`);
        }
        if (playTypes.length) {
            parts.push(`Play type: ${labelsFor(playTypes, PLAY_TYPE_OPTIONS)}`);
        }
        if (tempo.length) {
            parts.push(`Tempo: ${labelsFor(tempo, TEMPO_OPTIONS)}`);
        }
        customFilters.forEach((filter) => {
            if (filter.value === '' || filter.value == null) {
                return;
            }
            const field = CUSTOM_FIELD_CATALOG.find((entry) => entry.key === filter.field);
            if (!field) {
                return;
            }
            const operator = OPERATORS_BY_TYPE[field.type].find((entry) => entry.value === filter.operator);
            const value = field.type === 'enum' ? humanizeEnumValue(filter.value) : filter.value;
            parts.push(`${field.label} ${operator?.label || filter.operator} ${value}`);
        });
        return parts.join(', ');
    }, [sides, downs, fieldPositions, playTypes, tempo, customFilters]);

    const addCustomFilter = () => {
        const field = CUSTOM_FIELD_CATALOG[0];
        setCustomFilters((prev) => [
            ...prev,
            {
                id: nextFilterId.current++,
                field: field.key,
                operator: OPERATORS_BY_TYPE[field.type][0].value,
                value: '',
            },
        ]);
    };
    const updateCustomFilter = (id, patch) =>
        setCustomFilters((prev) => prev.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter)));
    const removeCustomFilter = (id) => setCustomFilters((prev) => prev.filter((filter) => filter.id !== id));

    const resetFilters = () => {
        setSides([]);
        setDowns([]);
        setFieldPositions([]);
        setPlayTypes([]);
        setTempo([]);
        setCustomFilters([]);
    };
    return {
        sides,
        setSides,
        downs,
        setDowns,
        fieldPositions,
        setFieldPositions,
        playTypes,
        setPlayTypes,
        tempo,
        setTempo,
        customFilters,
        setCustomFilters,
        filterSummary,
        addCustomFilter,
        updateCustomFilter,
        removeCustomFilter,
        resetFilters,
    };
};
export default useScoutingFilters;
