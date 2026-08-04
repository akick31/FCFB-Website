import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const ScoreTooltip = ({ active, payload, homeAbbr, awayAbbr }) => {
    if (!active || !payload || payload.length === 0) return null;
    const point = payload[0].payload;
    return (
        <Box sx={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', px: 1, py: 0.75, fontSize: '0.66rem', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
            <b>Q{point.quarter} {point.clock}</b><br />
            {awayAbbr} {point.away} - {point.home} {homeAbbr}
        </Box>
    );
};

ScoreTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, homeAbbr: PropTypes.string, awayAbbr: PropTypes.string };

const ScoreChart = ({ series, homeColor, awayColor, homeAbbr, awayAbbr }) => (
    <Box sx={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 12, bottom: 4, left: -14 }}>
                <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                <XAxis dataKey="index" hide />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} width={34} allowDecimals={false} />
                <Tooltip content={<ScoreTooltip homeAbbr={homeAbbr} awayAbbr={awayAbbr} />} />
                <Line type="stepAfter" dataKey="away" stroke={awayColor} strokeWidth={2.4} dot={false} isAnimationActive={false} />
                <Line type="stepAfter" dataKey="home" stroke={homeColor} strokeWidth={2.4} dot={false} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    </Box>
);

ScoreChart.propTypes = {
    series: PropTypes.array.isRequired,
    homeColor: PropTypes.string.isRequired,
    awayColor: PropTypes.string.isRequired,
    homeAbbr: PropTypes.string,
    awayAbbr: PropTypes.string,
};

export default ScoreChart;
