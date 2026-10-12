import React, { useState, useEffect, useRef } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import useProfileEditor from '../../hooks/useProfileEditor';
import { getUsernameHistory, addHistoricalUsername } from '../../api/userApi';
import { rowSx, lblSx, descSx, ctrlSx, inputSx, primarySx } from './profileStyles';

const PastUsernamesRow = ({ userId }) => {
    const [history, setHistory] = useState([]);
    const [draft, setDraft] = useState('');
    const { open, saving, error, toggle, save: saveEditor } = useProfileEditor();

    const historyScopeRef = useRef(null);

    useEffect(() => {
        if (!userId) {
            return;
        }
        const scope = { active: true, additions: [] };
        historyScopeRef.current = scope;
        const token = localStorage.getItem('token');
        getUsernameHistory(userId)
            .then((usernames) => {
                if (scope.active && localStorage.getItem('token') === token) {
                    setHistory([...usernames, ...scope.additions.filter((name) => !usernames.includes(name))]);
                }
            })
            .catch(() => {
                if (scope.active && localStorage.getItem('token') === token) {
                    setHistory([...scope.additions]);
                }
            });
        return () => {
            scope.active = false;
        };
    }, [userId]);

    const save = () => {
        const scope = historyScopeRef.current;
        const token = localStorage.getItem('token');
        const username = draft;
        return saveEditor(
            async () => {
                await addHistoricalUsername(userId, username);
                if (scope.active && localStorage.getItem('token') === token) {
                    scope.additions.push(username);
                    setHistory((previous) => [...previous, username]);
                }
            },
            () => setDraft('')
        );
    };

    return (
        <Box sx={{ borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
            <Box sx={{ ...rowSx, borderBottom: 0 }}>
                <Box>
                    <Box sx={lblSx}>Past usernames</Box>
                    <Box sx={descSx}>{history.length ? history.join(', ') : 'None on record'}</Box>
                </Box>
                <Box component="button" sx={ctrlSx} onClick={toggle}>
                    {open ? 'Cancel' : 'Add'}
                </Box>
            </Box>
            {open && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box
                        component="input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="A username you used to have"
                        sx={{ ...inputSx, flex: '1 1 220px' }}
                    />
                    <Box component="button" onClick={save} disabled={saving || !draft} sx={primarySx}>
                        {saving ? 'Saving…' : 'Save'}
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
};

PastUsernamesRow.propTypes = { userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]) };

export default PastUsernamesRow;
