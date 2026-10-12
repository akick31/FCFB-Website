import React from 'react';
import { Box } from '@mui/material';
import Panel from '../ui/Panel';
import { PLAY_COLUMNS } from '../../utils/scoutingReport';
import { ghostBtnSx } from './scoutingStyles';

const ScoutingColumnsPanel = ({ columns }) => {
    const { setHiddenColumns, saveColumns, savingColumns, loggedInUserId, hiddenColumns, toggleColumn } = columns;
    return (
        <Panel sx={{ mb: '16px' }}>
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: '8px', mb: '10px' }}>
                    <Box component="button" type="button" onClick={() => setHiddenColumns([])} sx={ghostBtnSx}>
                        Show all
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => setHiddenColumns([...PLAY_COLUMNS])}
                        sx={ghostBtnSx}
                    >
                        Hide all
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => saveColumns()}
                        disabled={savingColumns || !loggedInUserId}
                        sx={ghostBtnSx}
                    >
                        {savingColumns ? 'Saving…' : 'Save as default'}
                    </Box>
                </Box>
                <Box sx={{ columns: '180px', columnGap: '8px' }}>
                    {PLAY_COLUMNS.map((column) => (
                        <Box
                            key={column}
                            component="label"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                breakInside: 'avoid',
                                mb: '8px',
                            }}
                        >
                            <Box
                                component="input"
                                type="checkbox"
                                checked={!hiddenColumns.includes(column)}
                                onChange={() => toggleColumn(column)}
                            />
                            <Box component="span" sx={{ fontSize: '0.78rem', color: 'var(--text)' }}>
                                {column}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Panel>
    );
};
export default ScoutingColumnsPanel;
