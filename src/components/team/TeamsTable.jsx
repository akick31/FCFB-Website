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
import TeamRow from './TeamRow';

const TeamsTable = ({ teams, order, orderBy, handleRequestSort, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, handleNullValue, handleArrayValue }) => (
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Logo</TableCell>
                    <TableCell>
                        <TableSortLabel
                            active={orderBy === 'name'}
                            direction={orderBy === 'name' ? order : 'asc'}
                            onClick={() => handleRequestSort('name')}
                        >
                            Team Name
                        </TableSortLabel>
                    </TableCell>
                    <TableCell>Conference</TableCell>
                    <TableCell>Abbreviation</TableCell>
                    <TableCell>Record</TableCell>
                    <TableCell>Coaches</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {teams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((team) => (
                    <TeamRow key={team.id} team={team} handleNullValue={handleNullValue} handleArrayValue={handleArrayValue} />
                ))}
            </TableBody>
        </Table>
        <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={teams.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </TableContainer>
);

export default TeamsTable;