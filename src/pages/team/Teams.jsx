import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TablePagination,
    useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllTeams } from '../../api/teamApi';
import { formatConferenceName } from '../../utils/conferenceUtils';
import { DEFAULT_TEAMS_PER_PAGE, TEAMS_PER_PAGE_OPTIONS, TEAM_STATUS } from '../../constants/teamConstants';
import PageLayout from '../../components/layout/PageLayout';
import StyledTable from '../../components/ui/StyledTable';
import { TeamsFilters, getTeamsTableColumns } from '../../components/team';
import LoadingSpinner from '../../components/icons/LoadingSpinner';
import ErrorMessage from '../../components/message/ErrorMessage';

const Teams = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { conference: confParam, availability: availParam } = useParams();

    useEffect(() => { document.title = 'FCFB | Teams'; }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedConference, setSelectedConference] = useState('');
    const [selectedAvailability, setSelectedAvailability] = useState('');
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_TEAMS_PER_PAGE);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await getAllTeams();
                setTeams(data);
                setFilteredTeams(data);
                setLoading(false);
            } catch (error) {
                setError('Failed to load teams');
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        if (confParam && confParam !== 'all') {
            setSelectedConference(confParam.toUpperCase());
        } else if (confParam === 'all') {
            setSelectedConference('');
        }
        if (availParam && availParam !== 'all') {
            setSelectedAvailability(availParam);
        } else if (availParam === 'all') {
            setSelectedAvailability('');
        }
    }, [confParam, availParam]);

    const handleConferenceChange = (value) => {
        setSelectedConference(value);
        const availSlug = selectedAvailability || 'all';
        const confSlug = value ? value.toLowerCase() : 'all';
        navigate(`/teams/${confSlug}/${availSlug}`);
    };

    const handleAvailabilityChange = (value) => {
        setSelectedAvailability(value);
        const confSlug = selectedConference ? selectedConference.toLowerCase() : 'all';
        const availSlug = value || 'all';
        navigate(`/teams/${confSlug}/${availSlug}`);
    };

    useEffect(() => {
        let filtered = teams;

        // Filter by search term
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(team =>
                team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatConferenceName(team.conference).toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by conference
        if (selectedConference !== '') {
            filtered = filtered.filter(team => team.conference === selectedConference);
        }

        // Filter by availability
        if (selectedAvailability !== '') {
            const isTaken = selectedAvailability === TEAM_STATUS.TAKEN;
            filtered = filtered.filter(team => team.is_taken === isTaken);
        }

        setFilteredTeams(filtered);
        setPage(0); // Reset to first page when filters change
    }, [searchTerm, selectedConference, selectedAvailability, teams]);

    const handleTeamClick = (team) => {
        navigate(`/team-details/${team.id}`);
    };

    const getTeamHref = (team) => `/team-details/${team.id}`;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get current page data
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageTeams = filteredTeams.slice(startIndex, endIndex);

    // Get table columns
    const columns = getTeamsTableColumns(theme);

    if (loading) {
        return (
            <PageLayout
                title="College Football Teams"
                subtitle="Explore all teams across the FCFB league"
            >
                <LoadingSpinner />
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout
                title="College Football Teams"
                subtitle="Explore all teams across the FCFB league"
            >
                <ErrorMessage message={error} />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="College Football Teams"
            subtitle="Explore all teams across the FCFB league"
        >
            {/* Filters Section */}
            <TeamsFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedConference={selectedConference}
                setSelectedConference={handleConferenceChange}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={handleAvailabilityChange}
                teams={teams}
                filteredTeams={filteredTeams}
                theme={theme}
            />

            {/* Teams Table */}
            <Box sx={{ 
                backgroundColor: 'transparent',
                borderRadius: 0,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1],
                overflow: 'hidden'
            }}>
                <Box sx={{ 
                    p: 3, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: 'primary.main'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'white' }}>
                        Team Directory
                    </Typography>
                </Box>
                
                <StyledTable
                    columns={columns}
                    data={currentPageTeams}
                    onRowClick={handleTeamClick}
                    getRowHref={getTeamHref}
                    sx={{ 
                        '& .MuiTableContainer-root': {
                            borderRadius: 0,
                            boxShadow: 'none',
                            backgroundColor: 'transparent'
                        },
                        '& .MuiTable-root': {
                            backgroundColor: 'transparent'
                        }
                    }}
                />
                
                {/* Pagination */}
                <TablePagination
                    component="div"
                    count={filteredTeams.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={TEAMS_PER_PAGE_OPTIONS}
                    labelRowsPerPage="Teams per page:"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                    }
                    sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.grey[50]
                    }}
                />
            </Box>
        </PageLayout>
    );
};

export default Teams;