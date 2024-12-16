import React, { useEffect, useState } from "react";
import { getAllOngoingGames, getAllPastGames, getAllScrimmageGames, getAllPastScrimmageGames } from "../api/gameApi";
import { getScorebugByGameId, generateScorebugByGameId } from "../api/scorebugApi";
import ScorebugGrid from "../components/ScorebugGrid";
import { CircularProgress, Tab, Tabs, Typography, Box, Paper } from "@mui/material";
import { PageContainer, Header, TabContainer, ScoreboardContainer } from "../styles/GamesStyles";

// Styled Components


const Games = () => {
    const [games, setGames] = useState([]);
    const [scorebugs, setScorebugs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameType, setGameType] = useState("ongoing");

    const fetchGames = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (gameType === "ongoing") response = await getAllOngoingGames();
            else if (gameType === "past") response = await getAllPastGames();
            else if (gameType === "scrimmage") response = await getAllScrimmageGames();
            else if (gameType === "past-scrimmage") {
                response = await getAllPastScrimmageGames();
                console.log("Response Data:", response.data);
            }

            setGames(response.data);

            const scorebugsData = {};
            for (const game of response.data) {
                if (!scorebugs[game.game_id]) {
                    scorebugsData[game.game_id] = await getScorebugByGameId(game.game_id);
                }
            }
            setScorebugs(prevScorebugs => ({ ...prevScorebugs, ...scorebugsData }));
            setLoading(false);
        } catch (error) {
            setError(`Failed to load ${gameType} games`);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, [gameType]);

    const handleTabChange = (event, newValue) => {
        setGameType(newValue);
    };

    return (
        <div style={{ background: "#F7F9FC", minHeight: "100vh", padding: "20px 0" }}>
            <PageContainer>
                <Header>
                    <Typography variant="h3" style={{ fontWeight: "bold" }}>Nationwide Scoreboard</Typography>
                    <Typography variant="subtitle1">Follow live updates from games across the country</Typography>
                </Header>
                <TabContainer>
                    <Tabs
                        value={gameType}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="Ongoing Games" value="ongoing" />
                        <Tab label="Past Games" value="past" />
                        <Tab label="Scrimmages" value="scrimmage" />
                        <Tab label="Past Scrimmages" value="past-scrimmage" />
                    </Tabs>
                </TabContainer>
                {loading ? (
                    <CircularProgress />
                ) : error ? (
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                ) : games.length ? (
                    <ScoreboardContainer>
                        <ScorebugGrid games={games} scorebugs={scorebugs} />
                    </ScoreboardContainer>
                ) : (
                    <Typography variant="h6" style={{ marginTop: "20px" }}>
                        No {gameType.replace("-", " ")} games available
                    </Typography>
                )}
            </PageContainer>
        </div>
    );
};

export default Games;
