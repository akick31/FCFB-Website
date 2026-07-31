import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import { getAllUsers } from '../../api/userApi';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', font: 'inherit', fontSize: '0.82rem', minWidth: 210, boxSizing: 'border-box' };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const editBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const ROLE_OPTIONS = [
    { value: 'ALL', label: 'All roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CONFERENCE_COMMISSIONER', label: 'Conference commissioner' },
    { value: 'USER', label: 'User' },
];

const UserManagement = ({ user }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        if (!user || !user.role) return;
        if (user.role !== 'ADMIN' && user.role !== 'CONFERENCE_COMMISSIONER') navigate('*');
    }, [user, navigate]);

    useEffect(() => {
        getAllUsers()
            .then(setUsers)
            .catch((error) => console.error('Failed to fetch users:', error))
            .finally(() => setLoading(false));
    }, []);

    const filteredUsers = useMemo(() => {
        let filtered = users;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((row) =>
                row.username?.toLowerCase().includes(searchLower) ||
                row.coach_name?.toLowerCase().includes(searchLower) ||
                row.team?.toLowerCase().includes(searchLower) ||
                row.discord_tag?.toLowerCase().includes(searchLower));
        }
        if (roleFilter !== 'ALL') filtered = filtered.filter((row) => row.role === roleFilter);
        return filtered;
    }, [users, searchTerm, roleFilter]);

    if (loading) {
        return (
            <AdminLayout title="User Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="User Management"
            controls={(
                <>
                    <Box component="input" placeholder="Search username, coach, team, or discord..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                    <SelectPill label="Role" value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} sx={pillHeightSx} />
                </>
            )}
        >
            <Panel header="Users" more={`${filteredUsers.length} users`}>
                <DataTable minWidth={680}>
                    <thead>
                        <tr>
                            <th className="lft stick">Username</th>
                            <th className="lft">Coach</th>
                            <th className="lft">Discord</th>
                            <th className="lft">Team</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((row) => (
                            <tr key={row.id} onClick={() => navigate(`/user-details/${row.username}`)}>
                                <td className="lft stick">@{row.username}</td>
                                <td className="lft">{row.coach_name}</td>
                                <td className="lft">{row.discord_tag}</td>
                                <td className="lft">{row.team || 'Free agent'}</td>
                                <td>
                                    <Box component="button" type="button" onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit-coach/${row.username}`); }} sx={editBtnSx}>Edit</Box>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </Panel>
        </AdminLayout>
    );
};

UserManagement.propTypes = { user: PropTypes.object };

export default UserManagement;
