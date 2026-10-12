import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import DataTable from '../ui/DataTable';

const ScoutingPlaysTable = ({ visibleColumns, filteredPlays }) => (
    <DataTable minWidth={2400}>
        <thead>
            <tr>
                {visibleColumns.map((column) => (
                    <th key={column} className={`lft${column === 'play_id' ? ' stick' : ''}`}>
                        {column}
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
            {filteredPlays.map((play) => (
                <tr key={play.play_id}>
                    {visibleColumns.map((column) => {
                        const value = play[column];
                        const cell = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : (value ?? '');
                        return (
                            <td key={column} className={`lft${column === 'play_id' ? ' stick' : ''}`}>
                                {column === 'game_id' ? (
                                    <Box
                                        component={Link}
                                        to={`/game-details/${play.game_id}`}
                                        sx={{
                                            color: 'var(--brand)',
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {cell}
                                    </Box>
                                ) : (
                                    cell
                                )}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tbody>
    </DataTable>
);
export default ScoutingPlaysTable;
