import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../../ui/TeamName';
import { cellTone } from './cellTone';
import { isNeutralSite, weekNumbers } from './scheduleGrid';

const rowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    p: '10px 12px',
    border: 0,
    borderBottom: '1px solid var(--line-soft)',
    background: 'transparent',
    font: 'inherit',
    color: 'var(--text)',
    textAlign: 'left',
    cursor: 'pointer',
};

const TeamWeekList = ({ weeks, independent, locked, onGameClick, onOpenClick }) => (
    <Box>
        {weekNumbers.map((week) => {
            const cell = weeks[week];
            const label = (
                <Box
                    component="span"
                    sx={{ width: 44, color: 'var(--text-dim)', fontSize: '0.72rem', fontWeight: 800 }}
                >
                    WK {week}
                </Box>
            );
            if (!cell) {
                return (
                    <Box
                        key={week}
                        component="button"
                        type="button"
                        disabled={locked}
                        onClick={() => onOpenClick(week)}
                        sx={{ ...rowSx, color: 'var(--text-dim)', cursor: locked ? 'default' : 'pointer' }}
                    >
                        {label}
                        {locked ? 'Open' : 'Open: add a game'}
                    </Box>
                );
            }
            const tone = cellTone({
                conference: cell.gameType === 'CONFERENCE_GAME',
                neutral: isNeutralSite(cell),
                independent,
            });
            return (
                <Box
                    key={week}
                    component="button"
                    type="button"
                    onClick={() => onGameClick(cell, week)}
                    sx={{ ...rowSx, boxShadow: `inset 3px 0 0 ${tone.color}` }}
                >
                    {label}
                    <Box component="span" sx={{ color: 'var(--text-dim)', fontSize: '0.75rem', width: 18 }}>
                        {cell.isHome ? 'vs' : '@'}
                    </Box>
                    <TeamName name={cell.opponent} size={20} />
                </Box>
            );
        })}
    </Box>
);

TeamWeekList.propTypes = {
    weeks: PropTypes.object.isRequired,
    independent: PropTypes.bool,
    locked: PropTypes.bool,
    onGameClick: PropTypes.func.isRequired,
    onOpenClick: PropTypes.func.isRequired,
};

export default TeamWeekList;
