import { useState, useEffect, useRef } from 'react';
import { getConferenceRules, saveConferenceRules } from '../api/scheduleApi';

const DEFAULT_CONFERENCE_GAMES = 9;

const useConferenceRules = ({ code, onError, onSuccess }) => {
    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    const [protectedRivalries, setProtectedRivalries] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [rulesLoading, setRulesLoading] = useState(false);
    const [savingDivisions, setSavingDivisions] = useState(false);
    const requestScopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        requestScopeRef.current = scope;
        setSavingDivisions(false);
        setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
        setProtectedRivalries([]);
        setDivisions([]);
        const loadRules = async () => {
            setRulesLoading(true);
            try {
                const rules = await getConferenceRules(code);
                if (!scope.active) {
                    return;
                }
                if (rules) {
                    setNumConferenceGames(rules.numConferenceGames || DEFAULT_CONFERENCE_GAMES);
                    setProtectedRivalries(rules.protectedRivalries || []);
                    setDivisions(rules.divisions || []);
                } else {
                    setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                    setProtectedRivalries([]);
                    setDivisions([]);
                }
            } catch {
                if (!scope.active) {
                    return;
                }
                console.error('Error loading conference rules');
                setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries([]);
                setDivisions([]);
            } finally {
                if (scope.active) {
                    setRulesLoading(false);
                }
            }
        };
        loadRules();
        return () => {
            scope.active = false;
        };
    }, [code]);

    const divisionsEnabled = divisions.filter(Boolean).length > 0;

    const addRivalry = () => {
        setProtectedRivalries([...protectedRivalries, { team1: '', team2: '', week: null }]);
    };

    const removeRivalry = async (index) => {
        const scope = requestScopeRef.current;
        const rivalry = protectedRivalries[index];
        const updated = protectedRivalries.filter((_, i) => i !== index);

        if (!rivalry.team1 && !rivalry.team2) {
            setProtectedRivalries(updated);
            return;
        }

        try {
            await saveConferenceRules(code, numConferenceGames, updated);
            if (scope.active) {
                setProtectedRivalries(updated);
            }
        } catch {
            if (scope.active) {
                console.error('Error removing rivalry');
            }
        }
    };

    const updateRivalry = (index, fieldName, value) => {
        const updated = [...protectedRivalries];
        updated[index] = { ...updated[index], [fieldName]: value };
        setProtectedRivalries(updated);
    };

    const toggleDivisions = async (enabled) => {
        const scope = requestScopeRef.current;
        const updated = enabled ? ['', ''] : [];

        if (!enabled && divisions.some(Boolean)) {
            onError?.(null);
            try {
                await saveConferenceRules(code, numConferenceGames, protectedRivalries, updated);
                if (scope.active) {
                    setDivisions(updated);
                    onSuccess?.('Divisions disabled');
                }
            } catch (err) {
                if (scope.active) {
                    onError?.(err.message || 'Failed to disable divisions');
                }
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
        const scope = requestScopeRef.current;
        setSavingDivisions(true);
        onError?.(null);
        onSuccess?.(null);
        try {
            await saveConferenceRules(code, numConferenceGames, protectedRivalries, divisions);
            if (scope.active) {
                onSuccess?.('Divisions saved');
            }
        } catch (err) {
            if (scope.active) {
                onError?.(err.message || 'Failed to save divisions');
            }
        } finally {
            if (scope.active) {
                setSavingDivisions(false);
            }
        }
    };

    const handleSaveRules = async (conferenceCode, numGames, rivalries, divisionList) => {
        await saveConferenceRules(conferenceCode, numGames, rivalries, divisionList);
    };

    return {
        numConferenceGames,
        setNumConferenceGames,
        protectedRivalries,
        divisions,
        rulesLoading,
        divisionsEnabled,
        savingDivisions,
        addRivalry,
        removeRivalry,
        updateRivalry,
        toggleDivisions,
        updateDivision,
        saveDivisions,
        handleSaveRules,
    };
};

export default useConferenceRules;
