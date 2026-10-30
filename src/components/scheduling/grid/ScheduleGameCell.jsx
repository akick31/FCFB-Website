import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamMark from '../../ui/TeamMark';
import { cellTone } from './cellTone';
import { isNeutralSite } from './scheduleGrid';

const ScheduleGameCell = ({ cell, independent, locked, onClick, onDragStart, onDragEnd }) => {
    const conference = cell.gameType === 'CONFERENCE_GAME';
    const neutral = isNeutralSite(cell);
    const tone = cellTone({ conference, neutral, independent });
    const kind = `${conference ? 'Conference' : 'Out of conference'}${neutral ? ', neutral site' : ''}`;
    return (
        <Box
            component="button"
            type="button"
            draggable={!locked}
            onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                onDragStart();
            }}
            onDragEnd={onDragEnd}
            onClick={onClick}
            title={`${kind}: ${cell.isHome ? 'vs' : '@'} ${cell.opponent}`}
            aria-label={`${cell.isHome ? 'vs' : 'at'} ${cell.opponent}`}
            sx={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                py: '2px',
                border: 0,
                borderRadius: 'var(--r-sm)',
                font: 'inherit',
                color: 'var(--text)',
                cursor: locked ? 'pointer' : 'grab',
                background: tone.rest,
                boxShadow: neutral ? `inset 0 0 0 1px ${tone.color}` : 'none',
                '&:hover': { background: tone.hover },
            }}
        >
            <Box component="span" sx={{ fontSize: '0.6rem', color: 'var(--text-dim)', minWidth: 12 }}>
                {cell.isHome ? 'vs' : '@'}
            </Box>
            <TeamMark team={{ name: cell.opponent }} size={20} decorative />
        </Box>
    );
};

ScheduleGameCell.propTypes = {
    cell: PropTypes.shape({
        opponent: PropTypes.string,
        isHome: PropTypes.bool,
        gameType: PropTypes.string,
    }).isRequired,
    independent: PropTypes.bool,
    locked: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
};

export default ScheduleGameCell;
