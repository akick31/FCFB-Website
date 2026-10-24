import { useEffect, useRef } from 'react';
import { encodeHiddenColumns } from '../utils/scoutingReport';

const ARRAY_PARAMS = {
    sides: 'sides',
    downs: 'downs',
    fieldPositions: 'fp',
    playTypes: 'types',
    tempo: 'tempo',
    previousPlayCalls: 'ptypes',
};
const RANGE_PARAMS = { previousNumber: ['pnmin', 'pnmax'], scoreMargin: ['smmin', 'smmax'] };
const PREVIOUS_RESULT_PARAM = 'presult';
const parseRange = (searchParams, [minKey, maxKey]) => ({
    min: searchParams.get(minKey) ?? '',
    max: searchParams.get(maxKey) ?? '',
});
const parseIntArray = (value) =>
    value
        ? value
              .split(',')
              .map(Number)
              .filter((n) => !Number.isNaN(n))
        : [];
const parseStringArray = (value) =>
    value
        ? value
              .split(',')
              .filter(Boolean)
              .map((entry) => entry.toUpperCase())
        : [];

const useScoutingReportUrl = ({ searchParams, setSearchParams, report, filters, hiddenColumns }) => {
    const {
        targetOptions,
        setTargetLabel,
        gameCount,
        setGameCount,
        setRangeMode,
        generate,
        hasGenerated,
        reportTarget,
        rangeMode,
    } = report;
    const {
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
        previousNumber,
        setPreviousNumber,
        previousPlayCalls,
        setPreviousPlayCalls,
        previousResults,
        setPreviousResults,
        scoreMargin,
        setScoreMargin,
    } = filters;
    const autoRanRef = useRef(false);
    useEffect(() => {
        if (targetOptions.length === 0 || autoRanRef.current) {
            return;
        }
        autoRanRef.current = true;
        const urlCoach = searchParams.get('coach');
        const option = targetOptions.find((entry) => entry.value === urlCoach);
        if (!option) {
            return;
        }
        setTargetLabel(option.label);

        const urlGames = Number(searchParams.get('games'));
        const urlSeason = searchParams.get('season') === '1';
        const urlSides = parseStringArray(searchParams.get(ARRAY_PARAMS.sides));
        const urlDowns = parseIntArray(searchParams.get(ARRAY_PARAMS.downs));
        const urlFieldPositions = parseStringArray(searchParams.get(ARRAY_PARAMS.fieldPositions));
        const urlPlayTypes = parseStringArray(searchParams.get(ARRAY_PARAMS.playTypes));
        const urlTempo = parseStringArray(searchParams.get(ARRAY_PARAMS.tempo));
        const urlPreviousPlayCalls = parseStringArray(searchParams.get(ARRAY_PARAMS.previousPlayCalls));
        const urlPreviousResult = searchParams.get(PREVIOUS_RESULT_PARAM);

        const resolvedGameCount = urlGames > 0 ? urlGames : gameCount;
        const resolvedRangeMode = urlSeason ? 'season' : 'count';
        setGameCount(resolvedGameCount);
        setRangeMode(resolvedRangeMode);
        setSides(urlSides);
        setDowns(urlDowns);
        setFieldPositions(urlFieldPositions);
        setPlayTypes(urlPlayTypes);
        setTempo(urlTempo);
        setPreviousPlayCalls(urlPreviousPlayCalls);
        setPreviousResults(urlPreviousResult ? [urlPreviousResult.toUpperCase()] : []);
        setPreviousNumber(parseRange(searchParams, RANGE_PARAMS.previousNumber));
        setScoreMargin(parseRange(searchParams, RANGE_PARAMS.scoreMargin));

        generate(option.value, resolvedGameCount, resolvedRangeMode, false);
    }, [targetOptions]);

    useEffect(() => {
        if (!hasGenerated || !reportTarget) {
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.set('coach', reportTarget);
        next.set('games', String(gameCount));
        if (rangeMode === 'season') {
            next.set('season', '1');
        } else {
            next.delete('season');
        }
        const setOrDelete = (key, values) => {
            if (values.length) {
                next.set(key, values.join(','));
            } else {
                next.delete(key);
            }
        };
        const setOrDeleteLower = (key, values) => {
            if (values.length) {
                next.set(key, values.map((value) => String(value).toLowerCase()).join(','));
            } else {
                next.delete(key);
            }
        };
        setOrDeleteLower(ARRAY_PARAMS.sides, sides);
        setOrDelete(ARRAY_PARAMS.downs, downs);
        setOrDeleteLower(ARRAY_PARAMS.fieldPositions, fieldPositions);
        setOrDeleteLower(ARRAY_PARAMS.playTypes, playTypes);
        setOrDeleteLower(ARRAY_PARAMS.tempo, tempo);
        setOrDeleteLower(ARRAY_PARAMS.previousPlayCalls, previousPlayCalls);
        setOrDeleteLower(PREVIOUS_RESULT_PARAM, previousResults);
        const setOrDeleteRange = ([minKey, maxKey], range) => {
            if (range.min !== '') {
                next.set(minKey, String(range.min));
            } else {
                next.delete(minKey);
            }
            if (range.max !== '') {
                next.set(maxKey, String(range.max));
            } else {
                next.delete(maxKey);
            }
        };
        setOrDeleteRange(RANGE_PARAMS.previousNumber, previousNumber);
        setOrDeleteRange(RANGE_PARAMS.scoreMargin, scoreMargin);
        const colsEncoded = encodeHiddenColumns(hiddenColumns);
        if (colsEncoded) {
            next.set('cols', colsEncoded);
        } else {
            next.delete('cols');
        }
        setSearchParams(next, { replace: true });
    }, [
        reportTarget,
        gameCount,
        rangeMode,
        sides,
        downs,
        fieldPositions,
        playTypes,
        tempo,
        previousPlayCalls,
        previousResults,
        previousNumber,
        scoreMargin,
        hiddenColumns,
        hasGenerated,
    ]);
};
export default useScoutingReportUrl;
