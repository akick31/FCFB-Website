import {Card, useTheme} from "@mui/material";
import React from "react";
import StatsTable from "./StatsTable";

const GameStats = ({ homeTeam, awayTeam, homeStats, awayStats}) => {
    const theme = useTheme();
    return (
        <Card sx={theme.subCard}>
            <StatsTable
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                homeStats={homeStats}
                awayStats={awayStats}
            />
        </Card>

    );
}

export default GameStats;