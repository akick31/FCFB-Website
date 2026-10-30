import React from 'react';
import { Box } from '@mui/material';
import { Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import SelectPill from '../ui/SelectPill';
import { secondaryButtonSx } from '../../styles/controls';

const lockSx = (locked) => ({
    ...secondaryButtonSx,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: locked ? 'var(--live)' : 'var(--field)',
    borderColor: `color-mix(in srgb, ${locked ? 'var(--live)' : 'var(--field)'} 40%, var(--line))`,
});

const SeasonScheduleBar = ({
    season,
    seasons,
    onSeasonChange,
    locked,
    lockKnown,
    onToggleLock,
    onGenerateOoc,
    onValidate,
    onNewSeason,
}) => (
    <Box
        sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            p: '10px 12px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md, 10px)',
            background: 'var(--surface)',
            mb: '8px',
        }}
    >
        <SelectPill
            label="Season"
            value={season ?? ''}
            onChange={(value) => onSeasonChange(Number(value))}
            options={seasons.map((value) => ({ value, label: `Season ${value}` }))}
            sx={{ height: '38px' }}
        />
        <Box
            component="button"
            type="button"
            onClick={onToggleLock}
            disabled={!lockKnown}
            title={locked ? 'Unlock to edit. Postseason entries are never locked.' : 'Lock the regular season'}
            sx={lockSx(locked)}
        >
            {locked ? <LockIcon sx={{ fontSize: 15 }} /> : <LockOpenIcon sx={{ fontSize: 15 }} />}
            {locked ? 'Locked' : 'Unlocked'}
        </Box>
        {locked && (
            <Box sx={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Regular season is read-only; postseason stays editable.
            </Box>
        )}
        <Box sx={{ flex: 1 }} />
        <Box component="button" type="button" disabled={locked} onClick={onGenerateOoc} sx={secondaryButtonSx}>
            Generate OOC games
        </Box>
        <Box component="button" type="button" onClick={onValidate} sx={secondaryButtonSx}>
            Validate
        </Box>
        <Box component="button" type="button" onClick={onNewSeason} sx={secondaryButtonSx}>
            + New season
        </Box>
    </Box>
);

SeasonScheduleBar.propTypes = {
    season: PropTypes.number,
    seasons: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSeasonChange: PropTypes.func.isRequired,
    locked: PropTypes.bool,
    lockKnown: PropTypes.bool,
    onToggleLock: PropTypes.func.isRequired,
    onGenerateOoc: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
    onNewSeason: PropTypes.func.isRequired,
};

export default SeasonScheduleBar;
