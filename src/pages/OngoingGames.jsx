import React, { useEffect, useState } from "react";
import { getAllOngoingGames } from "../api/gameApi";
import { getScorebugByGameId } from "../api/scorebugApi";
import ScorebugGrid from "../components/ScorebugGrid";  // Import the ScorebugGrid component
import { CircularProgress } from "@mui/material";
import { CenteredContainer, ErrorText, InfoText } from "../styles/OngoingGamesStyles";

const OngoingGames = () => {
    const [games, setGames] = useState([]); // Ensure games is an empty array initially
    const [scorebugs, setScorebugs] = useState({}); // Store scorebugs by gameId for efficient rendering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await getAllOngoingGames(); // Get ongoing games
                setGames(response.data);

                // Fetch scorebugs for all the games that need it
                const scorebugsData = {};
                const ongoingGamesWithScorebugs = response.data.filter(game => !scorebugs[game.game_id]);

                // Fetch scorebugs for games that haven't been fetched yet
                if (ongoingGamesWithScorebugs.length > 0) {
                    for (const game of ongoingGamesWithScorebugs) {
                        scorebugsData[game.game_id] = await getScorebugByGameId(game.game_id);
                    }
                    setScorebugs(prevScorebugs => ({ ...prevScorebugs, ...scorebugsData }));
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching games:", error);
                setError("Failed to load ongoing games");
                setLoading(false);
            }
        };

        fetchGames();
    }, []); // Empty dependency array means this effect runs once when the component mounts

    if (loading) {
        return (
            <CenteredContainer>
                <CircularProgress /> {/* Material UI's loading spinner */}
            </CenteredContainer>
        );
    }

    if (error) {
        return (
            <CenteredContainer>
                <ErrorText>{error}</ErrorText>
            </CenteredContainer>
        );
    }

    if (!games.length) {
        return (
            <CenteredContainer>
                <InfoText>No ongoing games available</InfoText>
            </CenteredContainer>
        );
    }

    return (
        <CenteredContainer>
            {/* Using the ScorebugGrid to display the scorebugs in a table format */}
            <ScorebugGrid games={games} scorebugs={scorebugs} />
        </CenteredContainer>
    );
};

export default OngoingGames;
