import React from 'react';
import { useNavigate } from "react-router-dom";
import {
    Box,
    Grid,
    Typography,
    CardMedia,
    Pagination,
    IconButton,
    CircularProgress,
    Alert,
    Menu,
    useTheme
} from '@mui/material';
import PropTypes from 'prop-types';
import MenuIcon from "@mui/icons-material/Menu";
import FilterMenu from "../../menu/FilterMenu";

const ScorebugGrid = ({
    games,
    onPageChange,
    totalGames,
    currentPage,
    totalPages,
    category,
    filters,
    setFilters,
    onMenuToggle,
    menuOpen,
    menuAnchor,
    loading,
    error
    }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleCardClick = (gameId) => {
        navigate(`/game-details/${gameId}`);
    };

    return (
        <>
            {/* Filter Menu Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: 3 }}>
                <IconButton onClick={onMenuToggle}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>
                    Filters
                </Typography>
            </Box>

            {/* Loading & Error Handling */}
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        {/* Filter Menu */}
                        <Menu
                            anchorEl={menuAnchor}
                            open={menuOpen}
                            onClose={onMenuToggle}
                        >
                            <FilterMenu
                                onChange={setFilters}
                                onApply={onMenuToggle}
                                category={category}
                            />
                        </Menu>

                        {/* No Scoreboard Message */}
                        {games.length === 0 ? (
                            <Alert severity="info">No games found for the selected filters</Alert>
                        ) : (
                            <>
                                {/* Scorebug Grid - Ensures 6 per row on large screens, responsive for others */}
                                <Grid container spacing={2} justifyContent="center" pl={3}>
                                    {games.map((game) => (
                                        <Grid item xs={6} sm={3} md={2} key={game["game_id"]}>
                                            <Box
                                                onClick={() => handleCardClick(game["game_id"])}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    width: 125,
                                                    height: 140,
                                                    boxShadow: 'none',
                                                    border: 'none',
                                                    background: 'none',
                                                }}
                                            >
                                                {game.scorebug ? (
                                                    <CardMedia
                                                        component="img"
                                                        height="140"
                                                        image={`data:image/png;base64,${game.scorebug}`}
                                                        alt={`${game["home_team"]} vs ${game["away_team"]}`}
                                                        sx={{ objectFit: 'contain', boxShadow: 3, background: 'none' }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: 140,
                                                            backgroundColor: 'grey.200',
                                                            borderRadius: 1,
                                                        }}
                                                    >
                                                        <Typography variant="caption" color="textSecondary">
                                                            No Scorebug Available
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={ theme.pagination }>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage + 1}
                                            onChange={(e, page) => onPageChange(page - 1)}
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                )}
            </Box>
        </>
    );
};

ScorebugGrid.propTypes = {
    games: PropTypes.array.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalGames: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
};

export default ScorebugGrid;