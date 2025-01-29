import React, { useState, useEffect } from 'react';
import {
    Box,
    CircularProgress,
    Alert,
    FormControlLabel,
    Checkbox,
    Button,
    Menu,
    IconButton,
    Typography
} from '@mui/material';
import ConferenceDropdown from '../../dropdown/ConferenceDropdown';
import GameTypeDropdown from '../../dropdown/GameTypeDropdown';
import { GameFilter } from '../../filters/GameFilter';
import { sortGamesByTimeRemaining } from "../../sorting/sortGames";
import {fetchScorebugs} from "./FetchScorebugs";
import {fetchGames} from "./FetchGames";
import ScorebugGrid from '../ScorebugGrid';
import MenuIcon from "@mui/icons-material/Menu";

const OngoingGames = ({ menuOpen, menuAnchor, onMenuToggle }) => {
    const [games, setGames] = useState([]);
    const [scorebugs, setScorebugs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conference, setConference] = useState('');
    const [top25Only, setTop25Only] = useState(false);
    const [sortOption, setSortOption] = useState('least-time');
    const [gameType, setGameType] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedGames = await fetchGames('ongoing') || [];
                const filteredGames = await GameFilter(fetchedGames, 'All', false, null, null, "");
                const sortedGames = sortGamesByTimeRemaining(filteredGames, sortOption);
                setGames(sortedGames);

                try {
                    if (sortedGames.length > 0) {
                        setScorebugs(await fetchScorebugs(sortedGames));
                    }
                } catch (err) {
                    setError(`Failed to fetch scorebugs: ${err.message}`);
                }
            } catch (err) {
                setError(`Failed to fetch games: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [sortOption]);

    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case 'conference':
                setConference(value);
                break;
            case 'top25Only':
                setTop25Only(value);
                break;
            case 'sortOption':
                setSortOption(value);
                break;
            case 'gameType':
                setGameType(value);
                break;
            default:
                break;
        }
    };

    const handleApplyFilters = async () => {
        setLoading(true);
        try {
            const fetchedGames = await fetchGames('ongoing') || [];
            const filteredGames = await GameFilter(fetchedGames, conference, top25Only, null, null, gameType);
            const sortedGames = sortGamesByTimeRemaining(filteredGames, sortOption);
            setGames(sortedGames);

            try {
                if (sortedGames.length > 0) {
                    setScorebugs(await fetchScorebugs(sortedGames));
                }
            } catch (err) {
                setError(`Failed to fetch scorebugs: ${err.message}`);
            }
        } catch (err) {
            setError(`Failed to fetch games: ${err.message}`);
        } finally {
            onMenuToggle();
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'flex-start', pl: 14 }}>
                <IconButton onClick={onMenuToggle}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Filters
                </Typography>
            </Box>
            <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        {games.length === 0 && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                No games available at this time for this filter.
                            </Alert>
                        )}

                        <Menu
                            anchorEl={menuAnchor}
                            open={menuOpen}
                            onClose={onMenuToggle}
                            sx={{
                                '& .MuiMenu-paper': {
                                    padding: 2, // Add padding around the menu content
                                    minWidth: 250, // Set a minimum width for better layout
                                    borderRadius: 2, // Rounded corners for a more modern look
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                                }
                            }}
                        >
                            <ConferenceDropdown selectedConference={conference} onChange={(e) => handleFilterChange('conference', e.target.value)} />
                            <GameTypeDropdown selectedGameType={gameType} onChange={(e) => handleFilterChange('gameType', e.target.value)} />
                            <FormControlLabel
                                control={<Checkbox checked={top25Only} onChange={(e) => handleFilterChange('top25Only', e.target.checked)} />}
                                label="Show Only Top 25"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={sortOption === 'least-time'} onChange={() => handleFilterChange('sortOption', 'least-time')} />}
                                label="Sort by Least Time Remaining"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={sortOption === 'most-time'} onChange={() => handleFilterChange('sortOption', 'most-time')} />}
                                label="Sort by Most Time Remaining"
                            />
                            <Button
                                variant="contained"
                                onClick={handleApplyFilters}
                                sx={{
                                    width: '100%',
                                    backgroundColor: '#004260',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#00354d'
                                    }
                                }}
                            >
                                Apply Filters
                            </Button>
                        </Menu>
                        {games.length >= 1 && (
                            <ScorebugGrid games={games} scorebugs={scorebugs} />
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

export default OngoingGames;