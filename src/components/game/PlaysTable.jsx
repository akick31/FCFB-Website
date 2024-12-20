import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableSortLabel, TableBody, TableContainer, Paper } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';

const PlaysTable = ({ plays, page, rowsPerPage, orderBy, order, handleRequestSort, handleChangePage, handleChangeRowsPerPage }) => {
    const headers = [
        'play_number', 'home_score', 'away_score', 'quarter', 'clock', 'ball_location', 'possession',
        'down', 'yards_to_go', 'defensive_number', 'offensive_number', 'difference', 'defensive_submitter',
        'offensive_submitter', 'play_call', 'result', 'actual_result', 'yards', 'play_time', 'runoff_time',
        'win_probability', 'win_probability_added', 'offensive_response_speed', 'defensive_response_speed'
    ];

    return (
        <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
            <Table>
                <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableRow>
                        {headers.map((headCell) => (
                            <TableCell key={headCell}>
                                <TableSortLabel
                                    active={orderBy === headCell}
                                    direction={orderBy === headCell ? order : 'asc'}
                                    onClick={() => handleRequestSort(headCell)}
                                >
                                    {headCell.replace(/_/g, ' ').toUpperCase()}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {plays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((play) => (
                        <TableRow key={play.play_number} hover sx={{
                            backgroundColor: play.result === 'Touchdown' ? '#e6f2e6' : play.result === 'Turnover' ? '#f2e6e6' : 'inherit'
                        }}>
                            {headers.map((header) => (
                                <TableCell key={header}>{play[header]}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={plays.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
};

export default PlaysTable;