import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import CoachEditDialog from '../../components/admin/CoachEditDialog';
import TeamName from '../../components/ui/TeamName';
import PagedFooter from '../../components/ui/PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import { compact, secondaryButtonSx } from '../../styles/controls';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import LinkCell from '../../components/ui/LinkCell';
import SelectPill from '../../components/ui/SelectPill';
import { getAllUsers } from '../../api/userApi';

const searchSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    height: '38px',
    font: 'inherit',
    fontSize: '0.82rem',
    minWidth: 210,
    boxSizing: 'border-box',
};
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };

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
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [version, setVersion] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const editing = searchParams.get('edit');

    useEffect(() => {
        if (!user || !user.role) {
            return;
        }
        if (user.role !== 'ADMIN' && user.role !== 'CONFERENCE_COMMISSIONER') {
            navigate('*');
        }
    }, [user, navigate]);

    useEffect(() => {
        let active = true;
        getAllUsers()
            .then((loadedUsers) => {
                if (active) {
                    setUsers(loadedUsers);
                }
            })
            .catch((err) => {
                if (active) {
                    setError(err.message || 'Failed to load users');
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [version]);

    const closeEditor = () => setSearchParams({}, { replace: true });

    const coachSaved = () => {
        closeEditor();
        setVersion((current) => current + 1);
    };

    const filteredUsers = useMemo(() => {
        let filtered = users;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (row) =>
                    row.username?.toLowerCase().includes(searchLower) ||
                    row.coach_name?.toLowerCase().includes(searchLower) ||
                    row.team?.toLowerCase().includes(searchLower) ||
                    row.discord_tag?.toLowerCase().includes(searchLower)
            );
        }
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter((row) => row.role === roleFilter);
        }
        return filtered;
    }, [users, searchTerm, roleFilter]);
    const [fitRef, pageSize] = useFitCount({ rowHeight: 36 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(filteredUsers, pageSize, `${searchTerm}|${roleFilter}`);

    if (loading) {
        return (
            <AdminLayout title="User Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="User Management"
            controls={
                <>
                    <Box
                        component="input"
                        placeholder="Search username, coach, team, or discord..."
                        aria-label="Search users"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={searchSx}
                    />
                    <SelectPill
                        label="Role"
                        value={roleFilter}
                        onChange={setRoleFilter}
                        options={ROLE_OPTIONS}
                        sx={pillHeightSx}
                    />
                </>
            }
        >
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}
            <Panel header="Users" more={`${filteredUsers.length} users`}>
                <Box ref={fitRef}>
                    <DataTable minWidth={640} phoneMinWidth={0} tableLayout="fixed" dense>
                        <thead>
                            <tr>
                                <th className="lft stick" style={{ width: '22%' }}>
                                    Username
                                </th>
                                <th className="lft wide" style={{ width: '22%' }}>
                                    Coach
                                </th>
                                <th className="lft wide" style={{ width: '22%' }}>
                                    Discord
                                </th>
                                <th className="lft">Team</th>
                                <th style={{ width: 72 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageRows.map((row) => {
                                const userHref = `/user-details/${row.username}`;
                                return (
                                    <tr key={row.id}>
                                        <LinkCell to={userHref} className="lft stick">
                                            @{row.username}
                                        </LinkCell>
                                        <LinkCell to={userHref} className="lft wide">
                                            {row.coach_name}
                                        </LinkCell>
                                        <LinkCell to={userHref} className="lft wide">
                                            {row.discord_tag}
                                        </LinkCell>
                                        <LinkCell to={userHref} className="lft">
                                            {row.team ? <TeamName name={row.team} /> : 'Free agent'}
                                        </LinkCell>
                                        <LinkCell to={null}>
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => setSearchParams({ edit: row.username })}
                                                sx={{ ...compact(secondaryButtonSx), position: 'relative', zIndex: 3 }}
                                            >
                                                Edit
                                            </Box>
                                        </LinkCell>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DataTable>
                    <PagedFooter
                        page={page}
                        pageCount={pageCount}
                        pageSize={pageSize}
                        total={filteredUsers.length}
                        onChange={setPage}
                        noun="users"
                    />
                </Box>
            </Panel>
            {editing && <CoachEditDialog username={editing} user={user} onClose={closeEditor} onSaved={coachSaved} />}
        </AdminLayout>
    );
};

UserManagement.propTypes = { user: PropTypes.object };

export default UserManagement;
