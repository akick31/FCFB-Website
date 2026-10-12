import { useState, useEffect, useRef, useCallback } from 'react';
import { getScheduleBySeasonAndWeek, startGameWeek, getGameWeekJobStatus, retryFailedGames } from '../api/scheduleApi';

import { startPolling as startPoller } from '../utils/polling';

const POLL_INTERVAL_MS = 3000;

const useGameWeekStarter = (initialSeason, initialWeek, onError) => {
    const [weekSchedule, setWeekSchedule] = useState([]);
    const [selectedStartSeason, setSelectedStartSeason] = useState(null);
    const [selectedStartWeek, setSelectedStartWeek] = useState(null);
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const stopPollingRef = useRef(null);
    const mountedRef = useRef(false);
    const scheduleRequestRef = useRef(0);
    const jobRequestRef = useRef(0);
    const loadScheduleRef = useRef(null);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            scheduleRequestRef.current += 1;
            jobRequestRef.current += 1;
            stopPollingRef.current?.();
        };
    }, []);

    useEffect(() => {
        if (initialSeason && initialWeek) {
            setSelectedStartSeason(initialSeason);
            setSelectedStartWeek(initialWeek);
        }
    }, [initialSeason, initialWeek]);

    const fetchWeekSchedule = useCallback(
        async (signal) => {
            const request = ++scheduleRequestRef.current;
            try {
                const schedule = await getScheduleBySeasonAndWeek(selectedStartSeason, selectedStartWeek);
                if (mountedRef.current && request === scheduleRequestRef.current && !signal?.aborted) {
                    setWeekSchedule(schedule || []);
                }
            } catch (err) {
                if (mountedRef.current && request === scheduleRequestRef.current && !signal?.aborted) {
                    console.error('Failed to load week schedule:', err);
                    onErrorRef.current?.('Failed to load week schedule');
                }
            }
        },
        [selectedStartSeason, selectedStartWeek]
    );

    useEffect(() => {
        loadScheduleRef.current = fetchWeekSchedule;
        if (selectedStartSeason && selectedStartWeek) {
            fetchWeekSchedule();
        }
        return () => {
            scheduleRequestRef.current += 1;
        };
    }, [selectedStartSeason, selectedStartWeek, fetchWeekSchedule]);

    const startPolling = useCallback((jobId) => {
        stopPollingRef.current?.();
        stopPollingRef.current = startPoller(
            async (signal) => {
                const status = await getGameWeekJobStatus(jobId);
                if (signal.aborted) {
                    return;
                }
                setJobData(status);
                const complete = status.status === 'COMPLETED' || status.status === 'FAILED';
                if (complete) {
                    setIsStarting(false);
                }
                await loadScheduleRef.current(signal);
                return !complete;
            },
            POLL_INTERVAL_MS,
            (err) => console.error('Error polling job status:', err)
        );
    }, []);

    const handleStartWeek = async () => {
        const request = ++jobRequestRef.current;
        stopPollingRef.current?.();
        setConfirmDialogOpen(false);
        setIsStarting(true);
        setJobData(null);
        try {
            const startResult = await startGameWeek(selectedStartSeason, selectedStartWeek);
            if (!mountedRef.current || request !== jobRequestRef.current) {
                return;
            }
            setActiveJobId(startResult.jobId);
            startPolling(startResult.jobId);
        } catch (err) {
            if (!mountedRef.current || request !== jobRequestRef.current) {
                return;
            }
            console.error('Error starting week:', err);
            setIsStarting(false);
            onError?.(`Failed to start week: ${err.message}`);
        }
    };

    const handleStartWeekSelectionChange = (season, week) => {
        if (season && week) {
            setSelectedStartSeason(season);
            setSelectedStartWeek(week);
        }
    };

    const handleRetryFailed = async () => {
        if (!activeJobId) {
            return;
        }
        const request = ++jobRequestRef.current;
        stopPollingRef.current?.();
        setIsStarting(true);
        try {
            const retryResult = await retryFailedGames(activeJobId);
            if (!mountedRef.current || request !== jobRequestRef.current) {
                return;
            }
            setActiveJobId(retryResult.jobId);
            setJobData(null);
            startPolling(retryResult.jobId);
        } catch (err) {
            if (!mountedRef.current || request !== jobRequestRef.current) {
                return;
            }
            console.error('Error retrying failed games:', err);
            setIsStarting(false);
            onError?.(`Failed to retry: ${err.message}`);
        }
    };

    const stats = {
        total: weekSchedule.length,
        started: weekSchedule.filter((g) => g.started).length,
        notStarted: weekSchedule.filter((g) => !g.started).length,
    };

    return {
        weekSchedule,
        selectedStartSeason,
        setSelectedStartSeason,
        selectedStartWeek,
        setSelectedStartWeek,
        jobData,
        isStarting,
        confirmDialogOpen,
        setConfirmDialogOpen,
        activeJobId,
        stats,
        handleStartWeek,
        handleStartWeekSelectionChange,
        handleRetryFailed,
    };
};

export default useGameWeekStarter;
