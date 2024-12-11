import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams to get gameId from the URL
import { CircularProgress, TableBody, Paper } from "@mui/material";
import { getAllPlaysForGame } from "../api/playApi";
import { CenteredContainer, ErrorText, InfoText } from "../styles/OngoingGamesStyles";
import {
    StyledTableContainer,
    StyledTable,
    StyledTableCell,
    StyledTableHead,
    StyledTableHeadCell,
    StyledTableRow,
} from "../styles/TableStyles";

const GameDetails = () => {
    const { gameId } = useParams(); // Extract the gameId from the URL
    const [plays, setPlays] = useState([]); // Store the list of plays
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlays = async () => {
            try {
                const response = await getAllPlaysForGame(gameId); // Get plays for the specific game using the gameId
                // Sort plays by play number
                const sortedPlays = response.data.sort((a, b) => a.play_number - b.play_number);
                setPlays(sortedPlays); // Update the plays state
                setLoading(false);
            } catch (error) {
                console.error("Error fetching plays:", error);
                setError("Failed to load plays");
                setLoading(false);
            }
        };

        fetchPlays();
    }, [gameId]); // Re-run the effect only if the gameId changes

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

    if (plays.length === 0) {
        return (
            <CenteredContainer>
                <InfoText>No plays available for this game</InfoText>
            </CenteredContainer>
        );
    }

    return (
        <CenteredContainer>
            <StyledTableContainer component={Paper}>
                <StyledTable>
                    <StyledTableHead>
                        <StyledTableRow>
                            <StyledTableHeadCell>Play Number</StyledTableHeadCell>
                            <StyledTableHeadCell>Home Score</StyledTableHeadCell>
                            <StyledTableHeadCell>Away Score</StyledTableHeadCell>
                            <StyledTableHeadCell>Quarter</StyledTableHeadCell>
                            <StyledTableHeadCell>Clock</StyledTableHeadCell>
                            <StyledTableHeadCell>Ball Location</StyledTableHeadCell>
                            <StyledTableHeadCell>Possession</StyledTableHeadCell>
                            <StyledTableHeadCell>Down</StyledTableHeadCell>
                            <StyledTableHeadCell>Yards to Go</StyledTableHeadCell>
                            <StyledTableHeadCell>Defensive Number</StyledTableHeadCell>
                            <StyledTableHeadCell>Offensive Number</StyledTableHeadCell>
                            <StyledTableHeadCell>Difference</StyledTableHeadCell>
                            <StyledTableHeadCell>Defensive Submitter</StyledTableHeadCell>
                            <StyledTableHeadCell>Offensive Submitter</StyledTableHeadCell>
                            <StyledTableHeadCell>Play Call</StyledTableHeadCell>
                            <StyledTableHeadCell>Result</StyledTableHeadCell>
                            <StyledTableHeadCell>Actual Result</StyledTableHeadCell>
                            <StyledTableHeadCell>Yards</StyledTableHeadCell>
                            <StyledTableHeadCell>Play Time</StyledTableHeadCell>
                            <StyledTableHeadCell>Runoff Time</StyledTableHeadCell>
                            <StyledTableHeadCell>Win Probability</StyledTableHeadCell>
                            <StyledTableHeadCell>Win Probability Added</StyledTableHeadCell>
                            <StyledTableHeadCell>Offensive Response Speed</StyledTableHeadCell>
                            <StyledTableHeadCell>Defensive Response Speed</StyledTableHeadCell>
                        </StyledTableRow>
                    </StyledTableHead>
                    <TableBody>
                        {plays.map((play) => (
                            <StyledTableRow key={play.play_number}>
                                <StyledTableCell>{play.play_number}</StyledTableCell>
                                <StyledTableCell>{play.home_score}</StyledTableCell>
                                <StyledTableCell>{play.away_score}</StyledTableCell>
                                <StyledTableCell>{play.quarter}</StyledTableCell>
                                <StyledTableCell>{play.clock}</StyledTableCell>
                                <StyledTableCell>{play.ball_location}</StyledTableCell>
                                <StyledTableCell>{play.possession}</StyledTableCell>
                                <StyledTableCell>{play.down}</StyledTableCell>
                                <StyledTableCell>{play.yards_to_go}</StyledTableCell>
                                <StyledTableCell>{play.defensive_number}</StyledTableCell>
                                <StyledTableCell>{play.offensive_number}</StyledTableCell>
                                <StyledTableCell>{play.difference}</StyledTableCell>
                                <StyledTableCell>{play.defensive_submitter}</StyledTableCell>
                                <StyledTableCell>{play.offensive_submitter}</StyledTableCell>
                                <StyledTableCell>{play.play_call}</StyledTableCell>
                                <StyledTableCell>{play.result}</StyledTableCell>
                                <StyledTableCell>{play.actual_result}</StyledTableCell>
                                <StyledTableCell>{play.yards}</StyledTableCell>
                                <StyledTableCell>{play.play_time}</StyledTableCell>
                                <StyledTableCell>{play.runoff_time}</StyledTableCell>
                                <StyledTableCell>{play.win_probability}</StyledTableCell>
                                <StyledTableCell>{play.win_probability_added}</StyledTableCell>
                                <StyledTableCell>{play.offensive_response_speed}</StyledTableCell>
                                <StyledTableCell>{play.defensive_response_speed}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
        </CenteredContainer>
    );
};

export default GameDetails;
