import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import SegTabs from '../ui/SegTabs';
import MoveRow from './MoveRow';
import FitPagedList from '../ui/FitPagedList';
import { groupedPages } from '../../utils/paging';

const GROUP_TITLES = { risers: 'Rising', fallers: 'Falling', newcomers: 'New to the poll' };

const GroupTitle = ({ title }) => (
    <Box
        sx={{
            px: '14px',
            py: '4px',
            fontSize: '0.62rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
            background: 'var(--surface-2)',
        }}
    >
        {title}
    </Box>
);

GroupTitle.propTypes = { title: PropTypes.string.isRequired };

const byGroup = groupedPages((row) => row.group);

const moverRows = (moves, includeNewcomers) =>
    ['risers', 'fallers', ...(includeNewcomers ? ['newcomers'] : [])].flatMap((group) =>
        (moves?.[group] || []).map((move) => ({ key: `${group}-${move.team}`, group, move }))
    );

const MoversPanel = ({ poll, elo }) => {
    const [view, setView] = useState('poll');
    const shown = view === 'poll' ? poll : elo;
    const valueLabel = view === 'poll' ? (value) => `#${value}` : (value) => `${value}`;
    const rows = moverRows(shown, view === 'poll');
    const empty = rows.length === 0;
    return (
        <Panel sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: '8px 12px', borderBottom: '1px solid var(--line-soft)' }}>
                <SegTabs
                    value={view}
                    onChange={setView}
                    ariaLabel="Movers"
                    options={[
                        { value: 'poll', label: 'Coaches Poll' },
                        { value: 'elo', label: 'ELO' },
                    ]}
                />
            </Box>
            {empty ? (
                <Box sx={{ p: 2, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No movement since last week yet.
                </Box>
            ) : (
                <FitPagedList
                    rows={rows}
                    noun="teams"
                    resetKey={view}
                    paginate={byGroup}
                    renderRow={(row, index, pageRows) => (
                        <>
                            {pageRows[index - 1]?.group !== row.group && <GroupTitle title={GROUP_TITLES[row.group]} />}
                            <MoveRow move={row.move} valueLabel={valueLabel} />
                        </>
                    )}
                />
            )}
        </Panel>
    );
};

const movesShape = PropTypes.shape({ risers: PropTypes.array, fallers: PropTypes.array, newcomers: PropTypes.array });

MoversPanel.propTypes = { poll: movesShape, elo: movesShape };

export default MoversPanel;
