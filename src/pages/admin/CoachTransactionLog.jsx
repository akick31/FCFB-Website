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
    Grid
} from '@mui/material';
import { Search, History } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import StyledTable from '../../components/ui/StyledTable';
import { adminNavigationItems } from '../../config/adminNavigation';
import { useNavigate } from 'react-router-dom';

const CoachTransactionLog = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [teamFilter, setTeamFilter] = useState('ALL');
    const [positionFilter, setPositionFilter] = useState('ALL');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');

    const navigationItems = adminNavigationItems;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await getEntireCoachTransactionLog();
                setTransactions(response);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
                setError('Failed to load coach transaction log');
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

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

    const handleNavigationChange = (item) => {
        navigate(item.path);
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

    // Get unique teams, positions, and transaction types for filters
    const uniqueTeams = [...new Set(transactions.map(t => t.team))].filter(Boolean).sort();
    const uniquePositions = [...new Set(transactions.map(t => t.position))].filter(Boolean).sort();
    const uniqueTransactionTypes = [...new Set(transactions.map(t => t.transaction))].filter(Boolean).sort();

    // Transform transactions data for the table
    const tableData = filteredTransactions.map(transaction => ({
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

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <DashboardLayout
            title="Coach Transaction Log"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <History sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Coach Transaction Log
                    </Typography>
                </Box>
                
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
                    data={tableData}
                    maxHeight={600}
                    headerBackground="primary.main"
                    headerTextColor="white"
                />
            </Box>
        </DashboardLayout>
    );
};

export default CoachTransactionLog;
