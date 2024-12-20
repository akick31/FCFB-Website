import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer } from '@mui/material';

const StatsTable = ({ stats }) => (
    <>
        {
            stats && Object.keys(stats).map((statKey) => {
                const statValue = stats[statKey];
                return (
                    <TableContainer component={Paper} sx={{ width: '100%', marginBottom: 3 }} key={statKey}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableRow>
                                    <TableCell>{statKey.replace(/_/g, ' ').toUpperCase()}</TableCell>
                                    <TableCell>
                                        {typeof statValue === 'object' ? JSON.stringify(statValue) : statValue}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                        </Table>
                    </TableContainer>
                );
            })
        }
    </>
);

export default StatsTable;