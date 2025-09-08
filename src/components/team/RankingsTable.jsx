import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Typography,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatConference } from '../../utils/formatText';

const RankingsTable = ({ teams, rankingType }) => {
    const navigate = useNavigate();

    const handleRowClick = (team) => {
        navigate(`/team-details/${team.id}`);
    };

    const getRankingDisplayName = (type) => {
        switch (type) {
            case 'COACHES_POLL':
                return 'Coaches Poll';
            case 'PLAYOFF_RANKINGS':
                return 'Playoff Rankings';
            default:
                return '';
        }
    };

    const getRankingValue = (team, type) => {
        switch (type) {
            case 'COACHES_POLL':
                return team.coaches_poll_ranking;
            case 'PLAYOFF_RANKINGS':
                return team.playoff_committee_ranking;
            default:
                return null;
        }
    };

    const getRankingColor = () => {
        return '#004260'; // Main blue color for all rankings
    };

    return (
        <Box>
            {/* Rankings Header */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {getRankingDisplayName(rankingType)}
                </Typography>
                                       <Typography variant="body2" color="text.secondary">
                           Top 25 rankings • Click team to view details
                       </Typography>
            </Box>

            <TableContainer 
                component={Paper} 
                sx={{ 
                    marginTop: 2,
                    boxShadow: 3,
                    borderRadius: 2,
                    overflowX: 'auto', // Enable horizontal scrolling
                    '& .MuiTable-root': {
                        minWidth: 500, // Minimum table width to prevent squishing
                    }
                }}
            >
                <Table size="small">
                    {/* Table Header */}
                    <TableHead sx={{ 
                        backgroundColor: 'primary.main',
                        '& .MuiTableCell-head': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            padding: '12px 8px'
                        }
                    }}>
                        <TableRow>
                            <TableCell sx={{ width: '60px', padding: '12px 8px' }}>Rank</TableCell>
                            <TableCell sx={{ padding: '12px 8px' }}>Team</TableCell>
                            <TableCell sx={{ width: '100px', padding: '12px 8px' }}>Conference</TableCell>
                            <TableCell sx={{ width: '80px', padding: '12px 8px' }}>Record</TableCell>
                            <TableCell sx={{ width: '80px', padding: '12px 8px' }}>ELO</TableCell>
                        </TableRow>
                    </TableHead>

                    {/* Table Body */}
                    <TableBody>
                        {teams.map((team) => {
                            const ranking = getRankingValue(team, rankingType);
                            const overallWins = team.current_wins || 0;
                            const overallLosses = team.current_losses || 0;
                            
                            return (
                                <TableRow
                                    key={team.id}
                                    onClick={() => handleRowClick(team)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            transform: 'scale(1.01)',
                                            transition: 'all 0.2s ease-in-out'
                                        },
                                        '&:nth-of-type(even)': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                        }
                                    }}
                                >
                                    {/* Rank */}
                                    <TableCell sx={{ padding: '8px', textAlign: 'center' }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            <Chip
                                                label={ranking}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getRankingColor(),
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    minWidth: '32px',
                                                    height: '24px',
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </Box>
                                    </TableCell>

                                    {/* Team (Logo + Name) */}
                                    <TableCell sx={{ padding: '8px' }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1.5
                                        }}>
                                            {team.logo ? (
                                                <img 
                                                    src={team.logo} 
                                                    alt={team.name} 
                                                    style={{ 
                                                        width: 32, 
                                                        height: 32,
                                                        objectFit: 'contain'
                                                    }} 
                                                />
                                            ) : (
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    backgroundColor: 'grey.300',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {team.abbreviation || team.name?.substring(0, 2)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                    {team.name}
                                                </Typography>
                                                {team.abbreviation && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                        {team.abbreviation}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Conference */}
                                    <TableCell sx={{ padding: '8px' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            {formatConference(team.conference)}
                                        </Typography>
                                    </TableCell>

                                    {/* Record */}
                                    <TableCell sx={{ padding: '8px', textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                                            {overallWins}-{overallLosses}
                                        </Typography>
                                    </TableCell>

                                    {/* ELO */}
                                    <TableCell sx={{ padding: '8px', textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                                            {team.current_elo !== null && team.current_elo !== undefined ? 
                                                Math.round(team.current_elo) : 
                                                'N/A'
                                            }
                                        </Typography>
                                    </TableCell>


                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>


        </Box>
    );
};

RankingsTable.propTypes = {
    teams: PropTypes.array.isRequired,
    rankingType: PropTypes.string.isRequired
};

export default RankingsTable; 