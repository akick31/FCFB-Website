import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WinPctTrendChart = ({ seriesA, seriesB, nameA, nameB, colorA, colorB }) => {
    const seasons = [...new Set([...seriesA, ...seriesB].map((row) => row.season_number))].sort((a, b) => a - b);
    const data = seasons.map((season) => {
        const rowA = seriesA.find((row) => row.season_number === season);
        const rowB = seriesB.find((row) => row.season_number === season);
        return {
            season,
            [nameA]: rowA ? rowA.wins / (rowA.wins + rowA.losses || 1) : null,
            [nameB]: rowB ? rowB.wins / (rowB.wins + rowB.losses || 1) : null,
        };
    });
    return (
        <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 14, bottom: 20, left: 4 }}>
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
                        domain={[0, 1]}
                        tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                        tickLine={false}
                        axisLine={false}
                        width={46}
                        label={{
                            value: 'Win %',
                            angle: -90,
                            position: 'insideLeft',
                            fontSize: 11,
                            fill: 'var(--text-dim)',
                        }}
                    />
                    <Tooltip
                        labelFormatter={(season) => `Season ${season}`}
                        formatter={(value) => (value == null ? '-' : value.toFixed(3))}
                    />
                    <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.72rem' }} />
                    <Line
                        type="monotone"
                        dataKey={nameA}
                        stroke={colorA}
                        strokeWidth={2.4}
                        dot={{ r: 3 }}
                        connectNulls
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey={nameB}
                        stroke={colorB}
                        strokeWidth={2.4}
                        dot={{ r: 3 }}
                        connectNulls
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

WinPctTrendChart.propTypes = {
    seriesA: PropTypes.array.isRequired,
    seriesB: PropTypes.array.isRequired,
    nameA: PropTypes.string.isRequired,
    nameB: PropTypes.string.isRequired,
    colorA: PropTypes.string.isRequired,
    colorB: PropTypes.string.isRequired,
};

export default WinPctTrendChart;
