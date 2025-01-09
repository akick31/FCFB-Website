import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TableSortLabel,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatPlaybook, formatRole, formatPosition } from "../../utils/formatText";

const NewSignupsTable = ({
                        users,
                        order,
                        orderBy,
                        handleRequestSort,
                        page,
                        rowsPerPage,
                        handleChangePage,
                        handleChangeRowsPerPage
                    }) => {
    const [selectedRole] = useState('');
    const navigate = useNavigate();

    const handleRowClick = (username) => {
        navigate(`/user-details/${username}`);
    };

    const filteredUsers = selectedRole
        ? users.filter((user) => user.role === selectedRole)
        : users;

    return (
        <div>
            <TableContainer component={Paper}>
                <Table>
                    {/* Table Header */}
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                <TableSortLabel
                                    active={orderBy === 'coachName'}
                                    direction={orderBy === 'coachName' ? order : 'asc'}
                                    onClick={() => handleRequestSort('coachName')}
                                >
                                    Coach Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Discord Tag</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Discord ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Position</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Offensive Playbook</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Defensive Playbook</TableCell>
                        </TableRow>
                    </TableHead>

                    {/* Table Body */}
                    <TableBody>
                        {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                            <TableRow
                                key={user.username}
                                onClick={() => handleRowClick(user.username)}
                                style={{ cursor: 'pointer' }}
                                sx={{
                                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#e0e0e0',
                                    },
                                }}
                            >
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.coach_name}</TableCell>
                                <TableCell>{formatRole(user.role)}</TableCell>
                                <TableCell>{user.discord_tag}</TableCell>
                                <TableCell>{user.discord_id}</TableCell>
                                <TableCell>{formatPosition(user.position)}</TableCell>
                                <TableCell>{formatPlaybook(user.offensive_playbook)}</TableCell>
                                <TableCell>{formatPlaybook(user.defensive_playbook)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Table Pagination */}
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage === -1 ? users.length : rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </div>
    );
};

NewSignupsTable.propTypes = {
    users: PropTypes.array.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    handleRequestSort: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired
};

export default NewSignupsTable;