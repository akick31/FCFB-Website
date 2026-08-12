import { useState, useEffect, useRef, useCallback } from 'react';
import { getScheduleBySeasonAndWeek, startGameWeek, getGameWeekJobStatus, retryFailedGames } from '../api/scheduleApi';

const POLL_INTERVAL_MS = 3000;

const useGameWeekStarter = (initialSeason, initialWeek, onError) => {
    const [weekSchedule, setWeekSchedule] = useState([]);
    const [selectedStartSeason, setSelectedStartSeason] = useState(null);
    const [selectedStartWeek, setSelectedStartWeek] = useState(null);
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const pollIntervalRef = useRef(null);

    useEffect(() => () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); }, []);

    useEffect(() => {
        if (!initialSeason || !initialWeek) return;
        setSelectedStartSeason(initialSeason);
        setSelectedStartWeek(initialWeek);
        getScheduleBySeasonAndWeek(initialSeason, initialWeek)
            .then((schedule) => setWeekSchedule(schedule || []))
            .catch((err) => { console.error('Failed to load week schedule:', err); onError?.('Failed to load week schedule'); });
    }, [initialSeason, initialWeek]);

    const startPolling = useCallback((jobId) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        const poll = async () => {
            try {
                const status = await getGameWeekJobStatus(jobId);
                setJobData(status);
                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    setIsStarting(false);
                    const schedule = await getScheduleBySeasonAndWeek(selectedStartSeason, selectedStartWeek);
                    setWeekSchedule(schedule || []);
                }
            } catch (err) {
                console.error('Error polling job status:', err);
            }
        };
        poll();
        pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }, [selectedStartSeason, selectedStartWeek]);

    const handleStartWeek = async () => {
        setConfirmDialogOpen(false);
        setIsStarting(true);
        setJobData(null);
        try {
            const startResult = await startGameWeek(selectedStartSeason, selectedStartWeek);
            setActiveJobId(startResult.jobId);
            startPolling(startResult.jobId);
        } catch (err) {
            console.error('Error starting week:', err);
            setIsStarting(false);
            onError?.(`Failed to start week: ${err.message}`);
        }
    };

    const handleStartWeekSelectionChange = async (season, week) => {
        if (!season || !week) return;
        try {
            const schedule = await getScheduleBySeasonAndWeek(season, week);
            setWeekSchedule(schedule || []);
        } catch (err) {
            console.error('Failed to load schedule:', err);
            onError?.('Failed to load schedule');
        }
    };

    const handleRetryFailed = async () => {
        if (!activeJobId) return;
        setIsStarting(true);
        try {
            const retryResult = await retryFailedGames(activeJobId);
            setActiveJobId(retryResult.jobId);
            setJobData(null);
            startPolling(retryResult.jobId);
        } catch (err) {
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
