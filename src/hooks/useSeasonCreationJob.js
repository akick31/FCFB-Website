import { useEffect, useRef, useState } from 'react';
import { createSeasonForScheduling } from '../api/seasonApi';
import { generateAllConferenceSchedules, pollScheduleGenJobStatus } from '../api/scheduleApi';

const POLL_INTERVAL_MS = 2000;

const waitForNextPoll = (signal) =>
    new Promise((resolve) => {
        if (signal.aborted) {
            resolve();
            return;
        }
        const cancel = () => {
            clearTimeout(timer);
            resolve();
        };
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', cancel);
            resolve();
        }, POLL_INTERVAL_MS);
        signal.addEventListener('abort', cancel, { once: true });
    });

const useSeasonCreationJob = ({ isMountedRef, onSeasonCreated, showSnackbar }) => {
    const [createSeasonDialogOpen, setCreateSeasonDialogOpen] = useState(false);
    const [newSeasonNumber, setNewSeasonNumber] = useState('');
    const [creatingSeasonLoading, setCreatingSeasonLoading] = useState(false);
    const [createSeasonProgress, setCreateSeasonProgress] = useState('');
    const requestRef = useRef(null);
    useEffect(() => () => requestRef.current?.abort(), []);

    const isCurrent = (signal) => isMountedRef.current && !signal.aborted;

    const reportGenerationResult = (season, status) => {
        const games = status.totalGamesGenerated || 0;
        const unfinished =
            (status.totalConferences || 0) - (status.completedConferences || 0) - (status.failedConferences || 0);
        if (status.status === 'FAILED' && unfinished > 0) {
            showSnackbar(
                `Generated ${games} conference games before generation stopped. ${unfinished} conferences were not processed${status.failedConferences > 0 ? `; ${status.failedConferences} failed` : ''}. Check the conference tab to generate the remaining schedules individually.`,
                'warning'
            );
        } else if ((status.failedConferences || 0) > 0) {
            const failedConferences = (status.logs || [])
                .filter((log) => log.status === 'FAILED')
                .map((log) => log.conference);
            showSnackbar(
                `Generated ${games} conference games. Failed for: ${failedConferences.join(', ')}. You can regenerate those individually.`,
                'warning'
            );
        } else {
            showSnackbar(`Season ${season} created with ${games} conference games auto-generated!`, 'success');
        }
    };

    const trackGeneration = async (season, jobId, signal) => {
        while (isCurrent(signal)) {
            await waitForNextPoll(signal);
            if (!isCurrent(signal)) {
                return;
            }
            let status;
            try {
                status = await pollScheduleGenJobStatus(jobId);
            } catch (error) {
                if (isCurrent(signal)) {
                    console.error('Error polling generation status:', error);
                    showSnackbar(
                        `Season ${season} created, but lost track of generation progress. Check the conference tab.`,
                        'warning'
                    );
                }
                return;
            }
            if (!isCurrent(signal)) {
                return;
            }
            const completed = status.completedConferences || 0;
            const total = status.totalConferences || 0;
            const failed = status.failedConferences || 0;
            const games = status.totalGamesGenerated || 0;
            setCreateSeasonProgress(
                `Generating: ${completed}/${total} conferences done, ${games} games created${failed > 0 ? `, ${failed} failed` : ''}…`
            );
            if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                reportGenerationResult(season, status);
                return;
            }
        }
    };

    const generateSeasonSchedules = async (season, signal) => {
        try {
            const response = await generateAllConferenceSchedules(season);
            if (isCurrent(signal)) {
                await trackGeneration(season, response.jobId, signal);
            }
        } catch (error) {
            if (isCurrent(signal)) {
                console.error('Error starting conference schedule generation:', error);
                showSnackbar(
                    `Season ${season} created, but auto-generation failed: ${error.message}. You can generate schedules manually.`,
                    'warning'
                );
            }
        }
    };

    const openDialog = (defaultNumber) => {
        setNewSeasonNumber(String(defaultNumber));
        setCreateSeasonDialogOpen(true);
    };

    const handleCreateSeason = async () => {
        const season = parseInt(newSeasonNumber);
        if (!season || season <= 0) {
            showSnackbar('Please enter a valid season number', 'error');
            return;
        }
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setCreatingSeasonLoading(true);
        setCreateSeasonProgress('Creating season…');
        try {
            await createSeasonForScheduling(season);
            if (!isCurrent(controller.signal)) {
                return;
            }
            setCreateSeasonProgress('Season created. Starting conference schedule generation…');
            await generateSeasonSchedules(season, controller.signal);
            if (!isCurrent(controller.signal)) {
                return;
            }
            setCreateSeasonDialogOpen(false);
            setNewSeasonNumber('');
            await onSeasonCreated(season);
        } catch (error) {
            if (isCurrent(controller.signal)) {
                console.error('Error creating season:', error);
                showSnackbar('Failed to create season: ' + error.message, 'error');
            }
        } finally {
            if (isCurrent(controller.signal)) {
                setCreatingSeasonLoading(false);
                setCreateSeasonProgress('');
            }
        }
    };

    return {
        createSeasonDialogOpen,
        setCreateSeasonDialogOpen,
        newSeasonNumber,
        setNewSeasonNumber,
        creatingSeasonLoading,
        createSeasonProgress,
        openDialog,
        handleCreateSeason,
    };
};

export default useSeasonCreationJob;
