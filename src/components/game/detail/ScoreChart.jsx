import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { matchupColorsFor } from '../../../utils/chartColor';
import { useColorMode } from '../../../theme/ColorModeContext';

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

const LegendEntry = ({ color, name }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 11, height: 3, borderRadius: '2px', background: color }} />{name}</Box>
);

LegendEntry.propTypes = { color: PropTypes.string.isRequired, name: PropTypes.string };

const ScoreChart = ({ series, homeMark, awayMark, homeName, awayName }) => {
    const { mode } = useColorMode();
    const { home: homePlotColor, away: awayPlotColor } = matchupColorsFor(homeMark, awayMark, mode);
    return (
        <>
            <Box sx={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series} margin={{ top: 10, right: 12, bottom: 4, left: -14 }}>
                        <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                        <XAxis dataKey="index" hide />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} width={34} allowDecimals={false} />
                        <Tooltip content={<ScoreTooltip homeAbbr={homeMark?.abbreviation} awayAbbr={awayMark?.abbreviation} />} />
                        <Line type="stepAfter" dataKey="away" stroke={awayPlotColor} strokeWidth={2.4} dot={false} isAnimationActive={false} />
                        <Line type="stepAfter" dataKey="home" stroke={homePlotColor} strokeWidth={2.4} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <LegendEntry color={awayPlotColor} name={awayName} />
                <LegendEntry color={homePlotColor} name={homeName} />
            </Box>
        </>
    );
};

ScoreChart.propTypes = {
    series: PropTypes.array.isRequired,
    homeMark: PropTypes.object,
    awayMark: PropTypes.object,
    homeName: PropTypes.string,
    awayName: PropTypes.string,
};

export default ScoreChart;
