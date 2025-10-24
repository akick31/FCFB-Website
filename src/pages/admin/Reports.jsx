import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography,
    CircularProgress,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Tabs,
    Tab,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import { Search, History, People, TrendingUp, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getAllUsers } from '../../api/userApi';
import { getAllTeams } from '../../api/teamApi';
import StyledTable from '../../components/ui/StyledTable';
import { adminNavigationItems } from '../../config/adminNavigation';
import { useNavigate } from 'react-router-dom';

const Reports = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    
    // Transaction log states
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [transactionError, setTransactionError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('ALL');
    const [positionFilter, setPositionFilter] = useState('ALL');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');

    // User delay instances states
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [userDelayData, setUserDelayData] = useState([]);
    const [filteredUserDelayData, setFilteredUserDelayData] = useState([]);
    const [delayLoading, setDelayLoading] = useState(true);
    const [delayError, setDelayError] = useState(null);
    const [delaySearchTerm, setDelaySearchTerm] = useState('');
    const [delayTeamFilter, setDelayTeamFilter] = useState('ALL');
    const [delaySortField, setDelaySortField] = useState('delayInstances');
    const [delaySortDirection, setDelaySortDirection] = useState('desc');

    const navigationItems = adminNavigationItems;

    useEffect(() => {
        // If user is not loaded yet, just return (we're loading)
        if (!user || !user.role) {
            setTransactionLoading(true);
            setDelayLoading(true);
            return;
        }

        // Once the user is loaded, check the role
        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setTransactionLoading(false);
            setDelayLoading(false);
        }
    }, [user, navigate]);

    // Fetch transaction log data
    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const response = await getEntireCoachTransactionLog();
                setTransactions(response);
                setTransactionLoading(false);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
                setTransactionError('Failed to load coach transaction log');
                setTransactionLoading(false);
            }
        };

        if (user?.role === "ADMIN" || user?.role === "CONFERENCE_COMMISSIONER") {
            fetchTransactionData();
        }
    }, [user]);

    // Fetch user delay data
    useEffect(() => {
        const fetchDelayData = async () => {
            try {
                const [usersResponse, teamsResponse] = await Promise.all([
                    getAllUsers(),
                    getAllTeams()
                ]);
                setUsers(usersResponse);
                setTeams(teamsResponse);

                const delayData = usersResponse.map(user => ({
                    username: user.username,
                    discordTag: user.discord_tag || 'N/A',
                    team: user.team || 'No Team',
                    teamLogo: teamsResponse.find(t => t.name === user.team)?.logo || null,
                    delayInstances: user.delay_of_game_instances
                }));
                
                setUserDelayData(delayData);
                setDelayLoading(false);
            } catch (error) {
                console.error('Failed to fetch delay data:', error);
                setDelayError('Failed to load user delay data');
                setDelayLoading(false);
            }
        };

        if (user?.role === "ADMIN" || user?.role === "CONFERENCE_COMMISSIONER") {
            fetchDelayData();
        }
    }, [user]);

    // Filter transactions based on all criteria
    useEffect(() => {
        let filtered = transactions;
        
        // Filter by team
        if (teamFilter !== 'ALL') {
            filtered = filtered.filter(transaction => transaction.team === teamFilter);
        }
        
        // Filter by position
        if (positionFilter !== 'ALL') {
            filtered = filtered.filter(transaction => transaction.position === positionFilter);
        }
        
        // Filter by transaction type
        if (transactionTypeFilter !== 'ALL') {
            filtered = filtered.filter(transaction => transaction.transaction === transactionTypeFilter);
        }
        
        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(transaction => 
                transaction.team?.toLowerCase().includes(searchLower) ||
                transaction.processedBy?.toLowerCase().includes(searchLower) ||
                (transaction.coach && transaction.coach.some(coach => 
                    coach.toLowerCase().includes(searchLower)
                ))
            );
        }
        
        setFilteredTransactions(filtered);
    }, [transactions, teamFilter, positionFilter, transactionTypeFilter, searchTerm]);

    // Filter and sort user delay data
    useEffect(() => {
        let filtered = userDelayData;
        
        // Filter by team
        if (delayTeamFilter !== 'ALL') {
            filtered = filtered.filter(user => user.team === delayTeamFilter);
        }
        
        // Filter by search term
        if (delaySearchTerm) {
            const searchLower = delaySearchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.username?.toLowerCase().includes(searchLower) ||
                user.discordTag?.toLowerCase().includes(searchLower) ||
                user.team?.toLowerCase().includes(searchLower)
            );
        }
        
        // Sort the data
        filtered.sort((a, b) => {
            let aValue = a[delaySortField];
            let bValue = b[delaySortField];
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) {
                return delaySortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return delaySortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        setFilteredUserDelayData(filtered);
    }, [userDelayData, delayTeamFilter, delaySearchTerm, delaySortField, delaySortDirection]);

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleDelaySort = (field) => {
        if (delaySortField === field) {
            setDelaySortDirection(delaySortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setDelaySortField(field);
            setDelaySortDirection('asc');
        }
    };

    const getTransactionTypeColor = (transactionType) => {
        switch (transactionType) {
            case 'HIRE':
                return 'success';
            case 'FIRE':
                return 'error';
            case 'PROMOTE':
                return 'info';
            case 'DEMOTE':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getPositionColor = (position) => {
        switch (position) {
            case 'HEAD_COACH':
                return 'primary';
            case 'OFFENSIVE_COORDINATOR':
                return 'success';
            case 'DEFENSIVE_COORDINATOR':
                return 'warning';
            case 'SPECIAL_TEAMS_COORDINATOR':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            return dateString;
        }
    };

    const formatCoachList = (coachList) => {
        if (!coachList || !Array.isArray(coachList)) return 'N/A';
        return coachList.join(', ');
    };

    const transactionColumns = [
        { id: 'team', label: 'Team', width: 120 },
        { id: 'position', label: 'Position', width: 150 },
        { id: 'coach', label: 'Coach(es)', width: 200 },
        { id: 'transaction', label: 'Transaction', width: 120 },
        { id: 'transaction_date', label: 'Date', width: 150 },
        { id: 'processed_by', label: 'Processed By', width: 150 },
    ];

    const userDelayColumns = [
        { 
            id: 'username', 
            label: 'Username', 
            width: 150, 
            sortable: true,
            onClick: () => handleDelaySort('username')
        },
        { 
            id: 'discordTag', 
            label: 'Discord Tag', 
            width: 150, 
            sortable: true,
            onClick: () => handleDelaySort('discordTag')
        },
        { 
            id: 'team', 
            label: 'Team', 
            width: 200, 
            sortable: true,
            onClick: () => handleDelaySort('team')
        },
        { 
            id: 'delayInstances', 
            label: 'Delay of Game Instances', 
            width: 120, 
            sortable: true,
            onClick: () => handleDelaySort('delayInstances')
        },
    ];

    // Get unique teams, positions, and transaction types for filters
    const uniqueTeams = [...new Set(transactions.map(t => t.team))].filter(Boolean).sort();
    const uniquePositions = [...new Set(transactions.map(t => t.position))].filter(Boolean).sort();
    const uniqueTransactionTypes = [...new Set(transactions.map(t => t.transaction))].filter(Boolean).sort();
    const uniqueDelayTeams = [...new Set(userDelayData.map(u => u.team))].filter(Boolean).sort();

    // Transform transactions data for the table
    const transactionTableData = filteredTransactions.map(transaction => ({
        ...transaction,
        team: transaction.team || 'N/A',
        position: (
            <Chip
                label={transaction.position || 'N/A'}
                color={getPositionColor(transaction.position)}
                size="small"
            />
        ),
        coach: formatCoachList(transaction.coach),
        transaction: (
            <Chip
                label={transaction.transaction || 'N/A'}
                color={getTransactionTypeColor(transaction.transaction)}
                size="small"
            />
        ),
        transactionDate: formatDate(transaction.transactionDate),
        processedBy: transaction.processedBy || 'N/A',
    }));

    // Transform user delay data for the table
    const userDelayTableData = filteredUserDelayData.map(user => ({
        ...user,
        username: user.username,
        discordTag: user.discordTag,
        team: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user.teamLogo && (
                    <Avatar
                        src={user.teamLogo}
                        alt={user.team}
                        sx={{ width: 24, height: 24 }}
                    >
                        {user.team?.charAt(0)}
                    </Avatar>
                )}
                {user.team}
            </Box>
        ),
        delayInstances: (
            <Chip
                label={user.delayInstances}
                color={user.delayInstances > 5 ? 'error' : user.delayInstances > 2 ? 'warning' : 'success'}
                size="small"
            />
        ),
    }));

    if (transactionLoading || delayLoading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (transactionError || delayError) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography color="error">{transactionError || delayError}</Typography>
            </Box>
        );
    }

    return (
        <DashboardLayout
            title="Reports"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Reports
                    </Typography>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab 
                            icon={<People />} 
                            label="User Delay Instances" 
                            iconPosition="start"
                        />
                        <Tab 
                            icon={<History />} 
                            label="Coach Transaction Log" 
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {/* User Delay Instances Tab */}
                {activeTab === 0 && (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            User Delay Instances
                        </Typography>
                        
                        {/* Filter Controls */}
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search users..."
                                        value={delaySearchTerm}
                                        onChange={(e) => setDelaySearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'primary.main',
                                                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Team</InputLabel>
                                        <Select
                                            value={delayTeamFilter}
                                            onChange={(e) => setDelayTeamFilter(e.target.value)}
                                            label="Team"
                                            sx={{
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                            }}
                                        >
                                            <MenuItem value="ALL">All Teams</MenuItem>
                                            {uniqueDelayTeams.map(team => (
                                                <MenuItem key={team} value={team}>
                                                    {team}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                        
                        <TableContainer
                            sx={{
                                borderRadius: 0,
                                border: 'none',
                                boxShadow: 'none',
                                overflow: 'auto',
                                backgroundColor: 'transparent',
                                maxHeight: 600,
                            }}
                        >
                            <Table
                                stickyHeader={true}
                                sx={{
                                    minWidth: 650,
                                    '& .MuiTableCell-root': {
                                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        {userDelayColumns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align || 'left'}
                                                sx={{
                                                    backgroundColor: 'primary.main',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    py: 2,
                                                    px: 3,
                                                    borderBottom: '2px solid #1976d2',
                                                    cursor: column.sortable ? 'pointer' : 'default',
                                                    '&:hover': column.sortable ? {
                                                        backgroundColor: 'primary.dark',
                                                    } : {},
                                                }}
                                                onClick={column.onClick}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {column.label}
                                                    {column.sortable && (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                            {delaySortField === column.id ? (
                                                                delaySortDirection === 'asc' ? (
                                                                    <ArrowUpward sx={{ fontSize: 16 }} />
                                                                ) : (
                                                                    <ArrowDownward sx={{ fontSize: 16 }} />
                                                                )
                                                            ) : (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', opacity: 0.3 }}>
                                                                    <ArrowUpward sx={{ fontSize: 12, mb: -0.5 }} />
                                                                    <ArrowDownward sx={{ fontSize: 12 }} />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {userDelayTableData.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                cursor: 'default',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                },
                                                '&:nth-of-type(even)': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                                },
                                            }}
                                        >
                                            {userDelayColumns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align || 'left'}
                                                    sx={{
                                                        py: 2,
                                                        px: 3,
                                                        fontSize: '0.875rem',
                                                        color: 'text.primary',
                                                        fontWeight: column.id === 'username' || column.id === 'team' ? 600 : 400,
                                                    }}
                                                >
                                                    {column.render ? column.render(row[column.id], row) : row[column.id]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Coach Transaction Log Tab */}
                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            Coach Transaction Log
                        </Typography>
                        
                        {/* Filter Controls */}
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'primary.main',
                                                '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Team</InputLabel>
                                        <Select
                                            value={teamFilter}
                                            onChange={(e) => setTeamFilter(e.target.value)}
                                            label="Team"
                                            sx={{
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                            }}
                                        >
                                            <MenuItem value="ALL">All Teams</MenuItem>
                                            {uniqueTeams.map(team => (
                                                <MenuItem key={team} value={team}>
                                                    {team}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Position</InputLabel>
                                        <Select
                                            value={positionFilter}
                                            onChange={(e) => setPositionFilter(e.target.value)}
                                            label="Position"
                                            sx={{
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                            }}
                                        >
                                            <MenuItem value="ALL">All Positions</MenuItem>
                                            {uniquePositions.map(position => (
                                                <MenuItem key={position} value={position}>
                                                    {position.replace(/_/g, ' ')}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Transaction Type</InputLabel>
                                        <Select
                                            value={transactionTypeFilter}
                                            onChange={(e) => setTransactionTypeFilter(e.target.value)}
                                            label="Transaction Type"
                                            sx={{
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                            }}
                                        >
                                            <MenuItem value="ALL">All Transactions</MenuItem>
                                            {uniqueTransactionTypes.map(type => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                        
                        <StyledTable
                            columns={transactionColumns}
                            data={transactionTableData}
                            maxHeight={600}
                            headerBackground="primary.main"
                            headerTextColor="white"
                        />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
};

export default Reports;
