import React, { forwardRef, useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import StadiumEditor from '../../stadium/StadiumEditor';
import StadiumPicker, { BUILD_NEW } from '../../stadium/StadiumPicker';
import { assignTeamStadium } from '../../../api/stadiumApi';
import { buttonSx, inputSx, labelSx } from '../../stadium/stadiumStyles';

const TeamStadiumTab = forwardRef(({ team, stadium, canEdit, onStadiumChanged, onDirtyChange }, ref) => {
    const [choice, setChoice] = useState(stadium || '');
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => setChoice(stadium || ''), [stadium]);

    const building = choice === BUILD_NEW;
    const switching = !building && choice && choice !== stadium;

    const apply = async () => {
        setSaving(true);
        setError(null);
        try {
            const venue = building ? newName.trim() : choice;
            const saved = await assignTeamStadium({ team, venue, build_new: building });
            setNewName('');
            onStadiumChanged(saved.name);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Panel header="Home stadium">
                <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' },
                            gap: '10px',
                            alignItems: 'end',
                        }}
                    >
                        <Box>
                            <Box component="label" sx={labelSx}>
                                Plays home games at
                            </Box>
                            <StadiumPicker
                                value={choice}
                                onChange={setChoice}
                                allowBuild={canEdit}
                                disabled={!canEdit}
                            />
                        </Box>
                        {building && (
                            <Box>
                                <Box component="label" sx={labelSx} htmlFor="new-stadium-name">
                                    New stadium name
                                </Box>
                                <Box
                                    component="input"
                                    id="new-stadium-name"
                                    value={newName}
                                    onChange={(event) => setNewName(event.target.value)}
                                    sx={inputSx}
                                />
                            </Box>
                        )}
                        {canEdit && (building || switching) && (
                            <Box
                                component="button"
                                type="button"
                                onClick={apply}
                                disabled={saving || (building && !newName.trim())}
                                sx={buttonSx}
                            >
                                {saving ? 'Saving...' : building ? 'Build stadium' : 'Move to this stadium'}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                        Building a new stadium starts from a full crowd and keeps the old one, so you can move back to
                        it at any time. Past games keep the stadium they were played in.
                    </Box>
                </Box>
            </Panel>
            {stadium ? (
                <StadiumEditor
                    ref={ref}
                    name={stadium}
                    team={team}
                    canEdit={canEdit}
                    onRenamed={onStadiumChanged}
                    onDirtyChange={onDirtyChange}
                />
            ) : (
                <Alert severity="info">Pick or build a home stadium to design it.</Alert>
            )}
        </Box>
    );
});

TeamStadiumTab.displayName = 'TeamStadiumTab';

TeamStadiumTab.propTypes = {
    team: PropTypes.string.isRequired,
    stadium: PropTypes.string,
    canEdit: PropTypes.bool.isRequired,
    onStadiumChanged: PropTypes.func.isRequired,
    onDirtyChange: PropTypes.func,
};

export default TeamStadiumTab;
