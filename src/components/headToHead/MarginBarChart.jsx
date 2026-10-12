import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import {
    BarChart,
    Bar,
    Cell,
    ReferenceLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const MarginBarChart = ({ matchups, colorA, colorB }) => {
    const data = matchups.map((matchup, index) => ({
        index,
        season: matchup.season,
        margin:
            matchup.winner === 'A'
                ? -Math.abs(matchup.scoreA - matchup.scoreB)
                : Math.abs(matchup.scoreA - matchup.scoreB),
        winner: matchup.winner,
    }));
    return (
        <Box sx={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 14, bottom: 20, left: 4 }}>
                    <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                    <XAxis
                        dataKey="season"
                        tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                        tickLine={false}
                        axisLine={false}
                        label={{
                            value: 'Season',
                            position: 'insideBottom',
                            offset: -8,
                            fontSize: 11,
                            fill: 'var(--text-dim)',
                        }}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                        tickLine={false}
                        axisLine={false}
                        width={46}
                        label={{
                            value: 'Margin of victory',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 11,
                            fill: 'var(--text-dim)',
                        }}
                    />
                    <ReferenceLine y={0} stroke="var(--text-dim)" />
                    <Tooltip
                        labelFormatter={(season) => `Season ${season}`}
                        formatter={(value, name, item) => [
                            `${Math.abs(value)} pts`,
                            item.payload.winner === 'A' ? 'A' : 'B',
                        ]}
                    />
                    <Bar dataKey="margin" isAnimationActive={false}>
                        {data.map((entry) => (
                            <Cell key={entry.index} fill={entry.winner === 'A' ? colorA : colorB} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

MarginBarChart.propTypes = {
    matchups: PropTypes.array.isRequired,
    colorA: PropTypes.string.isRequired,
    colorB: PropTypes.string.isRequired,
};

export default MarginBarChart;
