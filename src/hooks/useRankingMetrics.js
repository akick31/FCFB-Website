import { useEffect, useRef, useState } from 'react';
import {
    computeRankingMetrics,
    backfillRankingMetrics,
    getRankingMetrics,
    getValidRankingMetricWeeks,
} from '../api/rankingMetricApi';
import { getAllSeasons } from '../api/seasonApi';
import { RANKING_METRIC_TYPES, rankingMetricHigherIsBetter } from '../constants/rankingMetrics';

const useRankingMetrics = () => {
    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState('');
    const [validWeeks, setValidWeeks] = useState([]);
    const [week, setWeek] = useState('');
    const [computing, setComputing] = useState(false);
    const [computeError, setComputeError] = useState('');
    const [computeResult, setComputeResult] = useState(null);

    const [backfilling, setBackfilling] = useState(false);
    const [backfillError, setBackfillError] = useState('');
    const [backfillResult, setBackfillResult] = useState(null);

    const [previewMetric, setPreviewMetric] = useState(RANKING_METRIC_TYPES[0].value);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewRows, setPreviewRows] = useState(null);
    const scopeRef = useRef(null);
    const periodRef = useRef(null);
    const backfillScopeRef = useRef(null);
    const previewRequestRef = useRef(null);
    const previewMetricRef = useRef(previewMetric);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    useEffect(() => {
        const period = { active: true };
        periodRef.current = period;
        setComputing(false);
        setComputeError('');
        setComputeResult(null);
        const preview = previewRequestRef.current;
        if (!preview || preview.season !== Number(season) || preview.week !== Number(week)) {
            previewRequestRef.current = null;
            setPreviewRows(null);
            setPreviewLoading(false);
        }
        return () => {
            period.active = false;
        };
    }, [season, week]);

    useEffect(() => {
        const scope = { active: true };
        backfillScopeRef.current = scope;
        setBackfilling(false);
        setBackfillError('');
        setBackfillResult(null);
        return () => {
            scope.active = false;
        };
    }, [season]);

    useEffect(() => {
        let active = true;
        getAllSeasons()
            .then((data) => {
                if (!active) {
                    return;
                }
                const seasonNumbers = [
                    ...new Set(
                        (data || [])
                            .map((entry) => entry.season_number ?? entry.seasonNumber)
                            .filter((value) => value != null)
                    ),
                ].sort((a, b) => b - a);
                setSeasons(seasonNumbers);
                setSeason((current) => current || seasonNumbers[0] || '');
            })
            .catch(() => {
                if (active) {
                    setSeasons([]);
                }
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!season) {
            setValidWeeks([]);
            return undefined;
        }
        let active = true;
        getValidRankingMetricWeeks(Number(season))
            .then((weeks) => {
                if (!active) {
                    return;
                }
                setValidWeeks(weeks || []);
                setWeek((current) => {
                    if (weeks?.includes(Number(current))) {
                        return current;
                    }
                    const numericWeeks = (weeks || []).map(Number).filter(Number.isFinite);
                    return numericWeeks.length ? Math.max(...numericWeeks) : '';
                });
            })
            .catch(() => {
                if (active) {
                    setValidWeeks([]);
                    setWeek('');
                }
            });
        return () => {
            active = false;
        };
    }, [season]);

    const loadPreview = async (seasonValue, weekValue, metricValue) => {
        if (!seasonValue || !weekValue) {
            return;
        }
        const scope = scopeRef.current;
        const request = { season: Number(seasonValue), week: Number(weekValue) };
        previewRequestRef.current = request;
        const isCurrent = () => scope.active && previewRequestRef.current === request;
        setPreviewLoading(true);
        try {
            const rows = await getRankingMetrics(Number(seasonValue), Number(weekValue), metricValue);
            const higherIsBetter = rankingMetricHigherIsBetter(metricValue);
            const sorted = [...(rows || [])].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
            if (isCurrent()) {
                setPreviewRows(sorted);
            }
        } catch {
            if (isCurrent()) {
                setPreviewRows([]);
            }
        } finally {
            if (isCurrent()) {
                setPreviewLoading(false);
            }
        }
    };

    const handleCompute = async () => {
        setComputeError('');
        setComputeResult(null);
        if (!season || !week) {
            setComputeError('Provide a season and week.');
            return;
        }
        const period = periodRef.current;
        setComputing(true);
        try {
            const result = await computeRankingMetrics(Number(season), Number(week));
            if (period.active) {
                setComputeResult(result);
                await loadPreview(season, week, previewMetricRef.current);
            }
        } catch (err) {
            if (period.active) {
                setComputeError(err.message);
            }
        } finally {
            if (period.active) {
                setComputing(false);
            }
        }
    };

    const changePreviewMetric = (value) => {
        previewMetricRef.current = value;
        setPreviewMetric(value);
        loadPreview(season, week, value);
    };

    const handleBackfill = async () => {
        setBackfillError('');
        setBackfillResult(null);
        if (!season) {
            setBackfillError('Provide a season.');
            return;
        }
        const scope = backfillScopeRef.current;
        const period = periodRef.current;
        setBackfilling(true);
        try {
            const results = await backfillRankingMetrics(Number(season));
            if (!scope.active) {
                return;
            }
            setBackfillResult(results);
            const resultWeeks = (results || []).map((entry) => Number(entry.week)).filter(Number.isFinite);
            const lastWeek = resultWeeks.length ? Math.max(...resultWeeks) : null;
            if (lastWeek && period.active) {
                setWeek(lastWeek);
                await loadPreview(season, lastWeek, previewMetricRef.current);
            }
        } catch (err) {
            if (scope.active) {
                setBackfillError(err.message);
            }
        } finally {
            if (scope.active) {
                setBackfilling(false);
            }
        }
    };

    return {
        seasons,
        season,
        setSeason,
        validWeeks,
        week,
        setWeek,
        computing,
        computeError,
        computeResult,
        backfilling,
        backfillError,
        backfillResult,
        previewMetric,
        previewLoading,
        previewRows,
        handleCompute,
        changePreviewMetric,
        handleBackfill,
    };
};

export default useRankingMetrics;
