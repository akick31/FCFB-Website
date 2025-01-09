import React, { useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import NewSignupsTable from '../components/users/NewSignupsTable'; // Import the table component
import {getNewSignups} from '../api/userApi';
import {useNavigate} from "react-router-dom"; // Assuming you have userApi for fetching users

const NewSignupsPage = ({ user }) => {
    const navigate = useNavigate();
    const [users, setNewSignups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('username'); // Assuming users are sorted by username initially
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (user.role === "USER") {
            navigate('*');
        }
    }, [user.role, navigate]);

    useEffect(() => {
        // Fetch the list of users
        const fetchNewSignups = async () => {
            try {
                const response = await getNewSignups(); // Assuming this returns the list of users
                setNewSignups(response);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setLoading(false);
            }
        };

        fetchNewSignups();
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <h2>New Signups</h2>
            <NewSignupsTable
                users={users}
                order={order}
                orderBy={orderBy}
                handleRequestSort={handleRequestSort}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    );
};

export default NewSignupsPage;