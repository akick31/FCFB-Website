import React, { useState, useEffect } from 'react';
import {CircularProgress, Box, useTheme, Card, Typography} from '@mui/material';
import UsersTable from '../components/users/UsersTable'; // Import the table component
import {getAllUsers} from '../api/userApi';
import {useNavigate} from "react-router-dom";
import {Header} from "../styles/GamesStyles"; // Assuming you have userApi for fetching users

const UsersPage = ({ user }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username'); // Assuming users are sorted by username initially
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        // If user is not loaded yet, just return (we're loading)
        if (!user || !user.role) {
            setLoading(true);
            return;
        }

        // Once the user is loaded, check the role
        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    useEffect(() => {
        // Fetch the list of users
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers(); // Assuming this returns the list of users
                setUsers(response);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={theme.root}>
            <Card sx={theme.standardCard}>
                <Header>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Users
                    </Typography>
                </Header>
                <UsersTable
                    users={users}
                    order={order}
                    orderBy={orderBy}
                    handleRequestSort={handleRequestSort}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Card>
        </Box>
    );
};

export default UsersPage;