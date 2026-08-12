import { useState } from 'react';
import { generateOutOfConferenceSchedule } from '../api/scheduleApi';

const useOocScheduleDialog = ({ season, onSuccess, showSnackbar }) => {
    const [oocDialogOpen, setOocDialogOpen] = useState(false);
    const [oocLoading, setOocLoading] = useState(false);
    const [oocResult, setOocResult] = useState(null);

    const openDialog = () => {
        setOocResult(null);
        setOocDialogOpen(true);
    };

    const handleGenerateOocSchedule = async () => {
        try {
            setOocLoading(true);
            const result = await generateOutOfConferenceSchedule(season);
            setOocResult(result);
            if (result.unmatchedSlots?.length > 0) {
                showSnackbar(`Scheduled ${result.gamesScheduled} OOC games, ${result.unmatchedSlots.length} slots left open`, 'warning');
            } else {
                showSnackbar(`Scheduled ${result.gamesScheduled} OOC games. Every team's schedule is full!`);
            }
            await onSuccess();
        } catch (err) {
            console.error('Error generating OOC schedule:', err);
            showSnackbar('Failed to generate OOC schedule: ' + err.message, 'error');
        } finally {
            setOocLoading(false);
        }
    };

    return {
        oocDialogOpen, setOocDialogOpen,
        oocLoading, oocResult,
        openDialog, handleGenerateOocSchedule,
    };
};

export default useOocScheduleDialog;
