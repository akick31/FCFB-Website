import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { TileGrid } from '../ui/StatTile';
import RankCard from './RankCard';
import { labelSx } from './headToHeadStyles';
import { formatWinPercentage } from '../../utils/headToHead';
const EntityRankGrid = ({ entityName, rankings, accent, rankLabel }) => {
    if (!rankings) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No ranking data for {entityName}.</Box>
        );
    }
    const cards = [
        {
            label: 'All-time record',
            value: `${formatWinPercentage(rankings.winPct.value)} · ${rankings.record.wins}-${rankings.record.losses}`,
            rank: rankings.winPct.rank,
        },
        {
            label: 'National championships',
            value: rankings.nationalChampionships.value,
            rank: rankings.nationalChampionships.rank,
        },
        {
            label: 'Conference championships',
            value: rankings.conferenceChampionships.value,
            rank: rankings.conferenceChampionships.rank,
        },
        { label: 'Bowl games', value: rankings.bowlGames.value, rank: rankings.bowlGames.rank },
        { label: 'Wins all time', value: rankings.wins.value, rank: rankings.wins.rank },
        { label: 'Losses all time', value: rankings.losses.value, rank: rankings.losses.rank },
        {
            label: 'Bowl record',
            value: `${formatWinPercentage(rankings.bowlWinPct.value)} · ${rankings.bowlRecord.wins}-${rankings.bowlRecord.losses}`,
            rank: rankings.bowlWinPct.rank,
        },
        { label: 'Weeks in coaches poll', value: rankings.weeksRanked.value, rank: rankings.weeksRanked.rank },
        { label: 'Weeks at #1', value: rankings.weeksAtOne.value, rank: rankings.weeksAtOne.rank },
    ];
    return (
        <>
            <Box sx={{ ...labelSx, mb: '8px' }}>{rankLabel}</Box>
            <TileGrid minTile={140}>
                {cards.map((card) => (
                    <RankCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        rank={card.rank}
                        totalEntities={rankings.totalEntities}
                        accent={accent}
                    />
                ))}
            </TileGrid>
        </>
    );
};

EntityRankGrid.propTypes = {
    entityName: PropTypes.string.isRequired,
    rankings: PropTypes.object,
    accent: PropTypes.string.isRequired,
    rankLabel: PropTypes.string.isRequired,
};

export default EntityRankGrid;
