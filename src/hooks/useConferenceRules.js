import { useState, useEffect } from 'react';
import { getConferenceRules, saveConferenceRules } from '../api/scheduleApi';

const DEFAULT_CONFERENCE_GAMES = 9;

const useConferenceRules = ({ code, onError, onSuccess }) => {
    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    const [protectedRivalries, setProtectedRivalries] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [savingDivisions, setSavingDivisions] = useState(false);

    useEffect(() => {
        const loadRules = async () => {
            setRulesLoading(true);
            try {
                const rules = await getConferenceRules(code);
                if (rules) {
                    setNumConferenceGames(rules.numConferenceGames || DEFAULT_CONFERENCE_GAMES);
                    setProtectedRivalries(rules.protectedRivalries || []);
                    setDivisions(rules.divisions || []);
                } else {
                    setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                    setProtectedRivalries([]);
                    setDivisions([]);
                }
            } catch (err) {
                console.error('Error loading conference rules:', err);
                setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries([]);
                setDivisions([]);
            } finally {
                setRulesLoading(false);
            }
        };
        loadRules();
    }, [code]);

    const divisionsEnabled = divisions.filter(Boolean).length > 0;

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
            await saveConferenceRules(code, numConferenceGames, updated);
            setProtectedRivalries(updated);
        } catch (err) {
            console.error('Error removing rivalry:', err);
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
            onError?.(null);
            try {
                await saveConferenceRules(code, numConferenceGames, protectedRivalries, updated);
                setDivisions(updated);
                onSuccess?.('Divisions disabled');
            } catch (err) {
                onError?.(err.message || 'Failed to disable divisions');
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

    const saveDivisions = async () => {
        setSavingDivisions(true);
        onError?.(null);
        onSuccess?.(null);
        try {
            await saveConferenceRules(code, numConferenceGames, protectedRivalries, divisions);
            onSuccess?.('Divisions saved');
        } catch (err) {
            onError?.(err.message || 'Failed to save divisions');
        } finally {
            setSavingDivisions(false);
        }
    };

    const handleSaveRules = async (conferenceCode, numGames, rivalries, divisionList) => {
        await saveConferenceRules(conferenceCode, numGames, rivalries, divisionList);
    };

    return {
        numConferenceGames, setNumConferenceGames,
        protectedRivalries, divisions, rulesLoading,
        divisionsEnabled, savingDivisions,
        addRivalry, removeRivalry, updateRivalry,
        toggleDivisions, updateDivision, saveDivisions,
        handleSaveRules,
    };
};

export default useConferenceRules;
