import { useState } from 'react';
import { validateSchedule } from '../api/scheduleApi';

const useValidateScheduleDialog = ({ season, showSnackbar }) => {
    const [validateDialogOpen, setValidateDialogOpen] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const handleValidateSchedule = async () => {
        setValidateDialogOpen(true);
        setValidating(true);
        setValidationResult(null);
        try {
            const result = await validateSchedule(season);
            setValidationResult(result);
        } catch (err) {
            console.error('Error validating schedule:', err);
            showSnackbar('Failed to validate schedule: ' + err.message, 'error');
            setValidateDialogOpen(false);
        } finally {
            setValidating(false);
        }
    };

    return {
        validateDialogOpen, setValidateDialogOpen,
        validating, validationResult,
        handleValidateSchedule,
    };
};

export default useValidateScheduleDialog;
