import { useEffect, useRef, useState } from 'react';
import { updateTeam } from '../api/teamApi';
import { isRealTeam } from '../utils/teamDataUtils';

const useTeamActiveOverrides = (teams, onSaved, onError) => {
    const [activeOverrides, setActiveOverrides] = useState({});
    const [savingActive, setSavingActive] = useState(false);
    const scopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    const effectiveActive = (team) => activeOverrides[team.name] ?? team.active;

    const handleToggleActive = (team) => {
        if (!isRealTeam(team)) {
            return;
        }
        setActiveOverrides((previous) => {
            const next = { ...previous };
            const newValue = !(previous[team.name] ?? team.active);
            if (!savingActive && newValue === team.active) {
                delete next[team.name];
            } else {
                next[team.name] = newValue;
            }
            return next;
        });
    };

    const pendingActiveCount = Object.keys(activeOverrides).length;

    const handleSaveActive = async () => {
        if (pendingActiveCount === 0) {
            return;
        }
        const scope = scopeRef.current;
        const submittedOverrides = activeOverrides;
        setSavingActive(true);
        onError(null);
        try {
            await Promise.all(
                Object.entries(submittedOverrides).map(([name, active]) => {
                    const team = teams.find((entry) => entry.name === name);
                    return updateTeam({ ...team, active });
                })
            );
            if (!scope.active) {
                return;
            }
            await onSaved();
            if (scope.active) {
                setActiveOverrides((current) =>
                    Object.fromEntries(
                        Object.entries(current).filter(([name, active]) => {
                            const savedActive =
                                submittedOverrides[name] ?? teams.find((team) => team.name === name)?.active;
                            return active !== savedActive;
                        })
                    )
                );
            }
        } catch (err) {
            if (scope.active) {
                onError(err.message || 'Failed to save team status changes');
            }
        } finally {
            if (scope.active) {
                setSavingActive(false);
            }
        }
    };

    return { effectiveActive, activeOverrides, handleToggleActive, pendingActiveCount, savingActive, handleSaveActive };
};

export default useTeamActiveOverrides;
