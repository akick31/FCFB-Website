import { useState } from 'react';
import { updateTeam } from '../api/teamApi';
import { isRealTeam } from '../utils/teamDataUtils';

const useTeamActiveOverrides = (teams, onSaved, onError) => {
    const [activeOverrides, setActiveOverrides] = useState({});
    const [savingActive, setSavingActive] = useState(false);

    const effectiveActive = (team) => activeOverrides[team.name] ?? team.active;

    const handleToggleActive = (team) => {
        if (!isRealTeam(team)) return;
        setActiveOverrides((prev) => {
            const next = { ...prev };
            const newValue = !effectiveActive(team);
            if (newValue === team.active) delete next[team.name];
            else next[team.name] = newValue;
            return next;
        });
    };

    const pendingActiveCount = Object.keys(activeOverrides).length;

    const handleSaveActive = async () => {
        if (pendingActiveCount === 0) return;
        setSavingActive(true);
        onError(null);
        try {
            await Promise.all(Object.entries(activeOverrides).map(([name, active]) => {
                const team = teams.find((entry) => entry.name === name);
                return updateTeam({ ...team, active });
            }));
            setActiveOverrides({});
            await onSaved();
        } catch (err) {
            onError(err.message || 'Failed to save team status changes');
        } finally {
            setSavingActive(false);
        }
    };

    return { effectiveActive, activeOverrides, handleToggleActive, pendingActiveCount, savingActive, handleSaveActive };
};

export default useTeamActiveOverrides;
