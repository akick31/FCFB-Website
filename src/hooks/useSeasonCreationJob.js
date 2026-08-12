import { useState } from 'react';
import { createSeasonForScheduling } from '../api/seasonApi';
import { generateAllConferenceSchedules, pollScheduleGenJobStatus } from '../api/scheduleApi';

const useSeasonCreationJob = ({ isMountedRef, onSeasonCreated, showSnackbar }) => {
    const [createSeasonDialogOpen, setCreateSeasonDialogOpen] = useState(false);
    const [newSeasonNumber, setNewSeasonNumber] = useState('');
    const [creatingSeasonLoading, setCreatingSeasonLoading] = useState(false);
    const [createSeasonProgress, setCreateSeasonProgress] = useState('');

    const openDialog = (defaultNumber) => {
        setNewSeasonNumber(String(defaultNumber));
        setCreateSeasonDialogOpen(true);
    };

    const handleCreateSeason = async () => {
        const num = parseInt(newSeasonNumber);
        if (!num || num <= 0) {
            showSnackbar('Please enter a valid season number', 'error');
            return;
        }
        setCreatingSeasonLoading(true);
        setCreateSeasonProgress('Creating season…');
        try {
            await createSeasonForScheduling(num);
            if (!isMountedRef.current) return;
            setCreateSeasonProgress('Season created. Starting conference schedule generation…');

            try {
                const jobResponse = await generateAllConferenceSchedules(num);
                const jobId = jobResponse.jobId;

                let done = false;
                while (!done && isMountedRef.current) {
                    await new Promise(r => setTimeout(r, 2000));
                    if (!isMountedRef.current) break;
                    try {
                        const status = await pollScheduleGenJobStatus(jobId);
                        if (!isMountedRef.current) break;
                        const completed = status.completedConferences || 0;
                        const total = status.totalConferences || 0;
                        const failed = status.failedConferences || 0;
                        const games = status.totalGamesGenerated || 0;
                        setCreateSeasonProgress(
                            `Generating: ${completed}/${total} conferences done, ${games} games created${failed > 0 ? `, ${failed} failed` : ''}…`
                        );

                        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                            done = true;
                            if (failed > 0) {
                                const failedConfs = (status.logs || [])
                                    .filter(l => l.status === 'FAILED')
                                    .map(l => l.conference);
                                showSnackbar(
                                    `Generated ${games} conference games. Failed for: ${failedConfs.join(', ')}. You can regenerate those individually.`,
                                    'warning'
                                );
                            } else {
                                showSnackbar(`Season ${num} created with ${games} conference games auto-generated!`, 'success');
                            }
                        }
                    } catch (pollErr) {
                        console.error('Error polling generation status:', pollErr);
                        done = true;
                        if (isMountedRef.current) {
                            showSnackbar(`Season ${num} created, but lost track of generation progress. Check the conference tab.`, 'warning');
                        }
                    }
                }
            } catch (genErr) {
                console.error('Error starting conference schedule generation:', genErr);
                if (isMountedRef.current) {
                    showSnackbar(`Season ${num} created, but auto-generation failed: ${genErr.message}. You can generate schedules manually.`, 'warning');
                }
            }

            if (!isMountedRef.current) return;
            setCreateSeasonDialogOpen(false);
            setNewSeasonNumber('');
            await onSeasonCreated(num);
        } catch (err) {
            console.error('Error creating season:', err);
            if (isMountedRef.current) {
                showSnackbar('Failed to create season: ' + err.message, 'error');
            }
        } finally {
            if (isMountedRef.current) {
                setCreatingSeasonLoading(false);
                setCreateSeasonProgress('');
            }
        }
    };

    return {
        createSeasonDialogOpen, setCreateSeasonDialogOpen,
        newSeasonNumber, setNewSeasonNumber,
        creatingSeasonLoading, createSeasonProgress,
        openDialog, handleCreateSeason,
    };
};

export default useSeasonCreationJob;
