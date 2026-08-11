import React from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import Toggle from '../ui/Toggle';
import LogoUrlField from './LogoUrlField';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };

const ConferenceSettingsPanel = ({
    code, conference, settingsForm, onFieldChange, savingSettings, settingsError, settingsSuccess, onToggleActive, onSubmit,
    divisionsEnabled, divisions, savingDivisions, onToggleDivisions, onUpdateDivision, onSaveDivisions,
}) => (
    <>
        <Panel header="Conference settings" sx={{ mb: '16px' }}>
            {settingsError && <Alert severity="error" sx={{ m: '16px 16px 0' }}>{settingsError}</Alert>}
            {settingsSuccess && <Alert severity="success" sx={{ m: '16px 16px 0' }}>{settingsSuccess}</Alert>}
            <Box component="form" onSubmit={onSubmit} sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <Box>
                        <Box sx={labelSx}>Code</Box>
                        <Box component="input" value={code} disabled sx={{ ...inputSx, opacity: 0.6 }} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Label</Box>
                        <Box component="input" value={settingsForm.label} onChange={(e) => onFieldChange('label', e.target.value)} required sx={inputSx} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Abbreviation</Box>
                        <Box component="input" value={settingsForm.abbreviation} onChange={(e) => onFieldChange('abbreviation', e.target.value)} placeholder="e.g. MWC" sx={inputSx} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Active</Box>
                        <Toggle on={!!conference.active} onClick={onToggleActive} />
                    </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <LogoUrlField label="Logo URL" value={settingsForm.logoUrl} onChange={(e) => onFieldChange('logoUrl', e.target.value)} previewBg="#ffffff" />
                    <LogoUrlField label="Dark logo URL" value={settingsForm.logoUrlDark} onChange={(e) => onFieldChange('logoUrlDark', e.target.value)} previewBg="#0a1620" />
                </Box>
                <Box component="button" type="submit" disabled={savingSettings} sx={{ ...btnSx, justifySelf: 'start' }}>
                    {savingSettings ? 'Saving...' : 'Save settings'}
                </Box>
            </Box>
        </Panel>

        <Panel header="Divisions">
            <Box sx={{ p: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                    <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{divisionsEnabled ? 'Enabled' : 'Disabled'}</Box>
                    <Box component="button" type="button" onClick={() => onToggleDivisions(!divisionsEnabled)} sx={ctrlSx}>
                        {divisionsEnabled ? 'Disable divisions' : 'Enable divisions'}
                    </Box>
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                    Optional. A conference has exactly two divisions. When enabled, teams can be assigned to a
                    division from the Teams tab, and division record is used when generating the schedule.
                </Box>

                {!divisionsEnabled ? (
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No divisions set. This conference schedules as one flat group.
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box component="input" value={divisions[0] || ''} onChange={(e) => onUpdateDivision(0, e.target.value)} placeholder="Division 1 name" sx={{ ...inputSx, flex: '1 1 220px' }} />
                        <Box component="input" value={divisions[1] || ''} onChange={(e) => onUpdateDivision(1, e.target.value)} placeholder="Division 2 name" sx={{ ...inputSx, flex: '1 1 220px' }} />
                        <Box component="button" type="button" onClick={onSaveDivisions} disabled={savingDivisions} sx={btnSx}>
                            {savingDivisions ? 'Saving...' : 'Save divisions'}
                        </Box>
                    </Box>
                )}
            </Box>
        </Panel>
    </>
);

ConferenceSettingsPanel.propTypes = {
    code: PropTypes.string.isRequired,
    conference: PropTypes.object.isRequired,
    settingsForm: PropTypes.shape({
        label: PropTypes.string,
        abbreviation: PropTypes.string,
        logoUrl: PropTypes.string,
        logoUrlDark: PropTypes.string,
    }).isRequired,
    onFieldChange: PropTypes.func.isRequired,
    savingSettings: PropTypes.bool,
    settingsError: PropTypes.string,
    settingsSuccess: PropTypes.string,
    onToggleActive: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    divisionsEnabled: PropTypes.bool.isRequired,
    divisions: PropTypes.array.isRequired,
    savingDivisions: PropTypes.bool,
    onToggleDivisions: PropTypes.func.isRequired,
    onUpdateDivision: PropTypes.func.isRequired,
    onSaveDivisions: PropTypes.func.isRequired,
};

export default ConferenceSettingsPanel;
