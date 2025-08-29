import React from 'react';
import { 
    Box,
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableSortLabel, 
    TableBody, 
    TableContainer,
    useTheme
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import PropTypes from 'prop-types';

const PlaysTable = ({ plays, page, rowsPerPage, orderBy, order, handleRequestSort, handleChangePage, handleChangeRowsPerPage }) => {
    const theme = useTheme();
    
    const headers = [
        'Play #', 'Home Score', 'Away Score', 'Quarter', 'Clock', 'Ball Location', 'Possession',
        'Down', 'Yards to Go', 'Defensive #', 'Offensive #', 'Difference', 'Defensive Submitter',
        'Offensive Submitter', 'Play Call', 'Result', 'Actual Result', 'Yards', 'Play Time', 'Runoff Time',
        'Win Probability', 'Win Probability Added', 'Offensive Response Speed', 'Defensive Response Speed'
    ];

    const headerKeys = [
        'play_number', 'home_score', 'away_score', 'quarter', 'clock', 'ball_location', 'possession',
        'down', 'yards_to_go', 'defensive_number', 'offensive_number', 'difference', 'defensive_submitter',
        'offensive_submitter', 'play_call', 'result', 'actual_result', 'yards', 'play_time', 'runoff_time',
        'win_probability', 'win_probability_added', 'offensive_response_speed', 'defensive_response_speed'
    ];

    const getResultColor = (result) => {
        if (result === 'Touchdown') return theme.palette.success.light + '20';
        if (result === 'Turnover') return theme.palette.error.light + '20';
        if (result === 'Field Goal') return theme.palette.warning.light + '20';
        return 'inherit';
    };

    return (
        <Box sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid #e9ecef',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: 3
        }}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                            {headerKeys.map((headCell, index) => (
                                <TableCell 
                                    key={headCell}
                                    sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        py: 1.5,
                                        px: 1,
                                        textAlign: 'center',
                                        borderBottom: 'none'
                                    }}
                                >
                                    <TableSortLabel
                                        active={orderBy === headCell}
                                        direction={orderBy === headCell ? order : 'asc'}
                                        onClick={() => handleRequestSort(headCell)}
                                        sx={{
                                            color: 'white',
                                            '&.MuiTableSortLabel-active': {
                                                color: 'white'
                                            },
                                            '& .MuiTableSortLabel-icon': {
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        {headers[index]}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plays.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((play, index) => (
                            <TableRow 
                                key={play.play_number} 
                                sx={{
                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                    '&:hover': { 
                                        backgroundColor: theme.palette.primary.light + '10',
                                        cursor: 'pointer'
                                    },
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                {headerKeys.map((header) => (
                                    <TableCell 
                                        key={header}
                                        sx={{
                                            py: 1,
                                            px: 1,
                                            fontSize: '0.75rem',
                                            textAlign: 'center',
                                            borderBottom: '1px solid #e9ecef',
                                            backgroundColor: header === 'result' ? getResultColor(play[header]) : 'inherit',
                                            fontWeight: header === 'result' ? 600 : 400
                                        }}
                                    >
                                        {play[header] !== null && play[header] !== undefined ? play[header] : '--'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <Box sx={{ 
                borderTop: '1px solid #e9ecef',
                backgroundColor: '#f8f9fa',
                px: 2
            }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={plays.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.875rem',
                            color: theme.palette.text.secondary
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

PlaysTable.propTypes = {
    plays: PropTypes.array.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    orderBy: PropTypes.string.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    handleRequestSort: PropTypes.func.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
}

export default PlaysTable;