import React, { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumPreview from './StadiumPreview';

const linkSx = {
    border: 0,
    background: 'transparent',
    color: 'var(--brand)',
    font: 'inherit',
    fontSize: '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
    p: 0,
};
import { getStadiumHistory, revertStadiumChange } from '../../api/stadiumApi';
import { primaryButtonSx } from '../../styles/controls';

const ACTION_LABELS = {
    CREATE: 'Created',
    UPDATE: 'Edited',
    RENAME: 'Renamed',
    MERGE: 'Merged',
    RETIRE: 'Retired',
    RESTORE: 'Restored',
    REVERT: 'Reverted',
};

const when = (changedAt) => new Date(changedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

const StadiumHistoryPanel = ({ stadium, canRevert, onReverted }) => {
    const [changes, setChanges] = useState(null);
    const [error, setError] = useState(null);
    const [previewing, setPreviewing] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            setChanges(await getStadiumHistory(stadium));
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }, [stadium]);

    useEffect(() => {
        load();
    }, [load]);

    const revert = async (id) => {
        setBusy(true);
        try {
            const saved = await revertStadiumChange(id);
            setConfirming(null);
            setPreviewing(null);
            await load();
            onReverted(saved);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box component="h2" sx={{ m: '0 0 8px', fontSize: '1rem', fontWeight: 800 }}>
                History
            </Box>
            {error && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>Couldn&apos;t load the history.</Box>}
            {!changes && !error && <CircularProgress size={20} />}
            {changes?.length === 0 && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>No changes yet.</Box>}
            {changes?.map((change) => (
                <Box key={change.id} sx={{ py: '10px', borderBottom: '1px solid var(--line-soft)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                        <Box sx={{ fontWeight: 800, fontSize: '0.84rem' }}>{ACTION_LABELS[change.action]}</Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.74rem', flex: 1 }}>
                            {when(change.changed_at)}
                            {change.changed_by && ` by ${change.changed_by}`}
                        </Box>
                        {change.before && (
                            <Box
                                component="button"
                                type="button"
                                onClick={() => setPreviewing(previewing === change.id ? null : change.id)}
                                sx={linkSx}
                            >
                                {previewing === change.id ? 'Hide' : 'Earlier version'}
                            </Box>
                        )}
                        {canRevert && change.before && confirming !== change.id && (
                            <Box component="button" type="button" onClick={() => setConfirming(change.id)} sx={linkSx}>
                                Revert
                            </Box>
                        )}
                        {confirming === change.id && (
                            <Box
                                component="button"
                                type="button"
                                onClick={() => revert(change.id)}
                                disabled={busy}
                                sx={{ ...primaryButtonSx, height: '28px', fontSize: '0.72rem' }}
                            >
                                {busy ? 'Reverting...' : 'Yes, go back to the earlier version'}
                            </Box>
                        )}
                    </Box>
                    {change.summary && (
                        <Box sx={{ color: 'var(--text-muted)', fontSize: '0.74rem', mt: '3px' }}>{change.summary}</Box>
                    )}
                    {previewing === change.id && (
                        <Box sx={{ mt: '8px' }}>
                            <StadiumPreview venue={stadium} design={change.before.design} title="Before this change" />
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    );
};

StadiumHistoryPanel.propTypes = {
    stadium: PropTypes.string.isRequired,
    canRevert: PropTypes.bool.isRequired,
    onReverted: PropTypes.func.isRequired,
};

export default StadiumHistoryPanel;
