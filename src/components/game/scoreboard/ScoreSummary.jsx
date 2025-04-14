import React from 'react';
import {
    BoxScore,
    FinalLabel,
    QuarterLabels,
    Rank, ScoreRow,
    ScoreSummaryContainer, TeamAbbr,
    TeamBox,
    TeamInfo,
    TeamLogo,
    TeamName,
    TeamRecord, TeamScore
} from "../../../styles/ScoreSummaryStyles";

const ScoreSummary = ({ game, homeTeam, awayTeam, homeStats, awayStats }) => {
    const showOT = homeStats.ot_score > 0 || awayStats.ot_score > 0;

    const getQuarters = (stats) => {
        const quarters = [stats.q1_score, stats.q2_score, stats.q3_score, stats.q4_score];
        if (showOT) quarters.push(stats.ot_score);
        return quarters;
    };

    const homeQuarters = getQuarters(homeStats);
    const awayQuarters = getQuarters(awayStats);

    return (
        <ScoreSummaryContainer>
            <TeamBox>
                {game.away_team_rank > 0 && <Rank>{game.away_team_rank}</Rank>}
                <TeamInfo>
                    <TeamName>{awayTeam.name}</TeamName>
                    <TeamRecord>{game.away_wins}-{game.away_losses}</TeamRecord>
                </TeamInfo>
                <TeamLogo src={awayTeam.logo} alt={awayTeam.name} />
                <TeamScore>{game.away_score}</TeamScore>
            </TeamBox>

            <BoxScore>
                <QuarterLabels sx={{ gridTemplateColumns: `50px repeat(${homeQuarters.length}, 30px) 30px` }}>
                    <div />
                    {[...Array(homeQuarters.length)].map((_, i) => (
                        <div key={i}>{i === 4 ? 'OT' : i + 1}</div>
                    ))}
                    <div>T</div>
                </QuarterLabels>

                <ScoreRow sx={{ gridTemplateColumns: `50px repeat(${awayQuarters.length}, 30px) 30px` }}>
                    <TeamAbbr>{awayTeam.abbreviation}</TeamAbbr>
                    {awayQuarters.map((score, i) => (
                        <div key={i}>{score}</div>
                    ))}
                    <div>{game.away_score}</div>
                </ScoreRow>

                <ScoreRow sx={{ gridTemplateColumns: `50px repeat(${homeQuarters.length}, 30px) 30px` }}>
                    <TeamAbbr>{homeTeam.abbreviation}</TeamAbbr>
                    {homeQuarters.map((score, i) => (
                        <div key={i}>{score}</div>
                    ))}
                    <div>{game.home_score}</div>
                </ScoreRow>
            </BoxScore>

            <TeamBox sx={{ justifyContent: 'flex-end' }}>
                <TeamScore>{game.home_score}</TeamScore>
                <TeamLogo src={homeTeam.logo} alt={homeTeam.name} />
                <TeamInfo sx={{ textAlign: 'right' }}>
                    <TeamName>{homeTeam.name}</TeamName>
                    <TeamRecord>{game.home_wins}-{game.home_losses}</TeamRecord>
                </TeamInfo>
                {game.home_team_rank > 0 && <Rank>{game.home_team_rank}</Rank>}
            </TeamBox>
        </ScoreSummaryContainer>
    );
};

export default ScoreSummary;