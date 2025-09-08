import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { formatConferenceName } from '../../utils/conferenceUtils';
import { formatTeamRecord, getTeamStatusText, getTeamStatusColor } from '../../utils/teamDataUtils';
import { TABLE_COLUMN_WIDTHS } from '../../constants/teamConstants';

/**
 * Team table columns configuration
 * @param {Object} theme - Material-UI theme object
 * @returns {Array} - Array of column configurations
 */
export const getTeamsTableColumns = (theme) => [
    { 
        id: 'logo', 
        label: '', 
        width: TABLE_COLUMN_WIDTHS.LOGO,
        align: 'center',
        render: (value, row) => (
            <Box
                component="img"
                src={row.logo || 'https://via.placeholder.com/40x40/004260/ffffff?text=T'}
                alt="Team Logo"
                sx={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover'
                }}
            />
        )
    },
    { 
        id: 'name', 
        label: 'Team', 
        width: TABLE_COLUMN_WIDTHS.TEAM_NAME,
        render: (value, row) => (
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {value || 'Unknown Team'}
                </Typography>
                {row.abbreviation && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.abbreviation}
                    </Typography>
                )}
            </Box>
        )
    },
    { 
        id: 'conference', 
        label: 'Conference', 
        width: TABLE_COLUMN_WIDTHS.CONFERENCE,
        render: (value) => (
            <Chip 
                label={formatConferenceName(value)} 
                size="small" 
                sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    color: 'white',
                    fontWeight: 500
                }}
            />
        )
    },
    { 
        id: 'currentRecord', 
        label: 'Current Record', 
        align: 'center', 
        width: TABLE_COLUMN_WIDTHS.CURRENT_RECORD,
        render: (value, row) => (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatTeamRecord(row.current_wins, row.current_losses)}
            </Typography>
        )
    },
    { 
        id: 'conferenceRecord', 
        label: 'Conf Record', 
        align: 'center', 
        width: TABLE_COLUMN_WIDTHS.CONFERENCE_RECORD,
        render: (value, row) => (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatTeamRecord(row.current_conference_wins, row.current_conference_losses)}
            </Typography>
        )
    },
    { 
        id: 'availability', 
        label: 'Status', 
        align: 'center', 
        width: TABLE_COLUMN_WIDTHS.STATUS,
        render: (value, row) => (
            <Chip 
                label={getTeamStatusText(row)} 
                size="small" 
                color={getTeamStatusColor(row)}
                sx={{ fontWeight: 500 }}
            />
        )
    },
    { 
        id: 'current_elo', 
        label: 'ELO', 
        align: 'center', 
        width: TABLE_COLUMN_WIDTHS.ELO,
        sortable: true,
        render: (value, row) => (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.current_elo !== null && row.current_elo !== undefined ? 
                    Math.round(row.current_elo) : 
                    'N/A'
                }
            </Typography>
        )
    }
]; 