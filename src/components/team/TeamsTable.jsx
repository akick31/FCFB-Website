import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TableSortLabel
} from '@mui/material';
import PropTypes from 'prop-types';
import TeamRow from "./TeamRow";

const TeamsTable = ({
    teams,
    order,
    orderBy,
    handleRequestSort,
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleNullValue,
    handleArrayValue,
    handleRowClick
}) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
                {/* Table Header */}
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Logo</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                            <TableSortLabel
                                active={orderBy === 'name'}
                                direction={orderBy === 'name' ? order : 'asc'}
                                onClick={() => handleRequestSort('name')}
                            >
                                Team Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Conference</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Abbreviation</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Record</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                            <TableSortLabel
                                active={orderBy === 'coach_discord_tags'}
                                direction={orderBy === 'coach_discord_tags' ? order : 'asc'}
                                onClick={() => handleRequestSort('coach_discord_tags')}
                            >
                                Coaches
                            </TableSortLabel>
                        </TableCell>
                    </TableRow>
                </TableHead>

                {/* Table Body */}
                <TableBody>
                    {teams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((team, index) => (
                        <TeamRow
                            key={team.id}
                            onClick={(event) => handleRowClick(event, team.user, team.name, team.id)}
                            style={{ cursor: 'pointer' }}
                            team={team}
                            handleNullValue={handleNullValue}
                            handleArrayValue={handleArrayValue}
                            sx={{
                                backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                },
                            }}
                        />
                    ))}
                </TableBody>
            </Table>

            {/* Table Pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, { label: 'All', value: -1 }]}
                component="div"
                count={teams.length}
                rowsPerPage={rowsPerPage === -1 ? teams.length : rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
};

TeamsTable.propTypes = {
    teams: PropTypes.array.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    handleRequestSort: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleNullValue: PropTypes.func.isRequired,
    handleArrayValue: PropTypes.func.isRequired
};

export default TeamsTable;