import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const POLL_TICKS = [1, 5, 10, 15, 20, 25];

const TrendTooltip = ({ active, payload, formatLabel }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
        <Box sx={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', px: 1, py: 0.75, fontSize: '0.68rem', color: 'var(--text)', boxShadow: 'var(--shadow)' }}>
            {formatLabel(payload[0].payload)}
        </Box>
    );
};

TrendTooltip.propTypes = { active: PropTypes.bool, payload: PropTypes.array, formatLabel: PropTypes.func.isRequired };

const MiniTrendChart = ({ data, color, reversed = false, yDomain, yTicks, formatLabel, height = 150 }) => {
    const domain = yDomain || (reversed ? [1, 25] : ['auto', 'auto']);
    const ticks = yTicks || (reversed ? POLL_TICKS : undefined);
    return (
        <Box sx={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={{ stroke: 'var(--line-soft)' }} />
                    <YAxis
                        reversed={reversed}
                        domain={domain}
                        ticks={ticks}
                        interval={ticks ? 0 : undefined}
                        padding={reversed ? { top: 8, bottom: 2 } : { top: 0, bottom: 0 }}
                        tick={{ fontSize: 10, fill: 'var(--text-dim)' }}
                        tickLine={false}
                        axisLine={false}
                        width={reversed ? 34 : 48}
                    />
                    <Tooltip content={<TrendTooltip formatLabel={formatLabel} />} cursor={{ stroke: 'var(--brand)', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.4} dot={false} activeDot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

MiniTrendChart.propTypes = {
    data: PropTypes.array.isRequired,
    color: PropTypes.string.isRequired,
    reversed: PropTypes.bool,
    yDomain: PropTypes.array,
    yTicks: PropTypes.array,
    formatLabel: PropTypes.func.isRequired,
    height: PropTypes.number,
};

export default MiniTrendChart;
