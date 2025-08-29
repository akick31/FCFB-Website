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

const StandingsTable = ({ teams, conference }) => {
    const navigate = useNavigate();

    const handleRowClick = (team) => {
        navigate(`/team-details/${team.id}`);
    };

    const getConferenceDisplayName = (conf) => {
        return formatConference(conf);
    };

    const calculateWinPercentage = (wins, losses) => {
        const total = wins + losses;
        if (total === 0) return '0.000';
        return (wins / total).toFixed(3);
    };



    return (
        <Box>
            {/* Conference Header */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {getConferenceDisplayName(conference)}
                </Typography>
                                       <Typography variant="body2" color="text.secondary">
                           {teams.length} teams • Sorted by conference win percentage, then alphabetically • Click team to view details
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
                        minWidth: 600, // Minimum table width to prevent squishing
                    }
                }}
            >
                <Table>
                    {/* Table Header */}
                    <TableHead sx={{ 
                        backgroundColor: 'primary.main',
                        '& .MuiTableCell-head': {
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                        }
                    }}>
                        <TableRow>
                            <TableCell sx={{ width: '60px' }}>Rank</TableCell>
                            <TableCell>Team</TableCell>
                            <TableCell sx={{ width: '100px' }}>Overall</TableCell>
                            <TableCell sx={{ width: '120px' }}>Conf Record</TableCell>
                            <TableCell sx={{ width: '100px' }}>Conf %</TableCell>
                        </TableRow>
                    </TableHead>

                    {/* Table Body */}
                    <TableBody>
                        {teams.map((team, index) => {
                            const overallWins = team.current_wins || 0;
                            const overallLosses = team.current_losses || 0;
                            const confWins = team.current_conference_wins || 0;
                            const confLosses = team.current_conference_losses || 0;
                            const confWinPct = calculateWinPercentage(confWins, confLosses);
                            
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
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            <Chip
                                                label={index + 1}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'primary.main',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    minWidth: '32px'
                                                }}
                                            />
                                        </Box>
                                    </TableCell>

                                    {/* Team (Logo + Name) */}
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2
                                        }}>
                                            {team.logo ? (
                                                <img 
                                                    src={team.logo} 
                                                    alt={team.name} 
                                                    style={{ 
                                                        width: 40, 
                                                        height: 40,
                                                        objectFit: 'contain'
                                                    }} 
                                                />
                                            ) : (
                                                <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    backgroundColor: 'grey.300',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {team.abbreviation || team.name?.substring(0, 2)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {team.name}
                                                </Typography>
                                                {team.abbreviation && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {team.abbreviation}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>



                                    {/* Overall Record */}
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {overallWins}-{overallLosses}
                                        </Typography>
                                    </TableCell>

                                    {/* Conference Record */}
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {confWins}-{confLosses}
                                        </Typography>
                                    </TableCell>

                                    {/* Conference Win Percentage */}
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                            {confWinPct}
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

StandingsTable.propTypes = {
    teams: PropTypes.array.isRequired,
    conference: PropTypes.string.isRequired
};

export default StandingsTable; 