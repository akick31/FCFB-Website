import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import FitPagedList from '../ui/FitPagedList';
import MoveRow from '../home/MoveRow';
import { rankMovers } from '../../utils/homeHighlights';

const rankValue = (value) => `#${value}`;

const MoverColumn = ({ title, moves, resetKey }) => (
    <Panel header={title} more={`${moves.length}`}>
        {moves.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>None</Box>
        ) : (
            <FitPagedList
                rows={moves.map((move) => ({ key: move.team, move }))}
                noun="teams"
                resetKey={resetKey}
                renderRow={({ move }) => <MoveRow move={move} valueLabel={rankValue} />}
            />
        )}
    </Panel>
);

MoverColumn.propTypes = {
    title: PropTypes.string.isRequired,
    moves: PropTypes.array.isRequired,
    resetKey: PropTypes.string,
};

const RankingMovers = ({ rows, resetKey, showNewcomers }) => {
    const movers = rankMovers(rows.map((row) => ({ team: row.team.name, rank: row.rank, prev: row.prev })));
    if (movers.risers.length + movers.fallers.length + movers.newcomers.length === 0) {
        return (
            <Panel>
                <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No movement from the week before.
                </Box>
            </Panel>
        );
    }
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: `repeat(${showNewcomers ? 3 : 2}, minmax(0, 1fr))` },
                gap: '14px',
                alignItems: 'start',
            }}
        >
            <MoverColumn title="Rising" moves={movers.risers} resetKey={resetKey} />
            <MoverColumn title="Falling" moves={movers.fallers} resetKey={resetKey} />
            {showNewcomers && <MoverColumn title="New this week" moves={movers.newcomers} resetKey={resetKey} />}
        </Box>
    );
};

RankingMovers.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({ rank: PropTypes.number, prev: PropTypes.number, team: PropTypes.object }))
        .isRequired,
    resetKey: PropTypes.string,
    showNewcomers: PropTypes.bool,
};

export default RankingMovers;
