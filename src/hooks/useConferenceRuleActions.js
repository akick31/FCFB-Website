import { saveConferenceRules } from '../api/scheduleApi';
import { formatConference } from './useConferencesMap';

const useConferenceRuleActions = ({
    selectedConference,
    numConferenceGames,
    protectedRivalries,
    setProtectedRivalries,
    divisions,
    setDivisions,
    showSnackbar,
}) => {
    const addRivalry = () => {
        setProtectedRivalries([...protectedRivalries, { team1: '', team2: '', week: null }]);
    };

    const removeRivalry = async (index) => {
        const rivalry = protectedRivalries[index];
        const updated = protectedRivalries.filter((_, i) => i !== index);

        if (!rivalry.team1 && !rivalry.team2) {
            setProtectedRivalries(updated);
            return;
        }

        try {
            await saveConferenceRules(selectedConference, numConferenceGames, updated);
            setProtectedRivalries(updated);
            showSnackbar('Rivalry removed');
        } catch (err) {
            console.error('Error removing rivalry:', err);
            showSnackbar('Failed to remove rivalry: ' + err.message, 'error');
        }
    };

    const updateRivalry = (index, fieldName, value) => {
        const updated = [...protectedRivalries];
        updated[index] = { ...updated[index], [fieldName]: value };
        setProtectedRivalries(updated);
    };

    const toggleDivisions = async (enabled) => {
        const updated = enabled ? ['', ''] : [];

        if (!enabled && divisions.some(Boolean)) {
            try {
                await saveConferenceRules(selectedConference, numConferenceGames, protectedRivalries, updated);
                setDivisions(updated);
                showSnackbar('Divisions disabled');
            } catch (err) {
                console.error('Error disabling divisions:', err);
                showSnackbar('Failed to disable divisions: ' + err.message, 'error');
            }
            return;
        }

        setDivisions(updated);
    };

    const updateDivision = (index, value) => {
        const updated = [...divisions];
        updated[index] = value;
        setDivisions(updated);
    };

    const handleSaveConferenceRules = async (conference, numGames, rivalries, divisionList) => {
        try {
            await saveConferenceRules(conference, numGames, rivalries, divisionList);
            showSnackbar(`Conference rules saved for ${formatConference(conference)}`);
        } catch (err) {
            console.error('Error saving conference rules:', err);
            showSnackbar('Failed to save conference rules: ' + err.message, 'error');
        }
    };

    return { addRivalry, removeRivalry, updateRivalry, toggleDivisions, updateDivision, handleSaveConferenceRules };
};
export default useConferenceRuleActions;
