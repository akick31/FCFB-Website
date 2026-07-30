import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamMark from '../../ui/TeamMark';

const W = 440;
const H = 214;
const PAD_L = 46;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 22;

const xOf = (index, count) => PAD_L + index * (W - PAD_L - PAD_R) / (count - 1 || 1);
const yOf = (value) => PAD_T + (value / 100) * (H - PAD_T - PAD_B);
const sideOf = (value) => (value >= 50 ? 1 : 0);

const buildSegments = (series) => {
    const count = series.length;
    const points = series.map((point, i) => [xOf(i, count), point.homeWinProb]);
    const segments = [];
    let current = { side: sideOf(points[0][1]), points: [points[0]] };
    for (let i = 1; i < points.length; i += 1) {
        const [prevX, prevValue] = points[i - 1];
        const [x, value] = points[i];
        const side = sideOf(value);
        if (side === current.side) {
            current.points.push([x, value]);
        } else {
            const t = (50 - prevValue) / (value - prevValue);
            const crossX = prevX + (x - prevX) * t;
            current.points.push([crossX, 50]);
            segments.push(current);
            current = { side, points: [[crossX, 50], [x, value]] };
        }
    }
    segments.push(current);
    return segments;
};

const WinProbChart = ({ series, homeColor, awayColor, homeMark, awayMark, quarterMarks }) => {
    const [hover, setHover] = useState(null);
    if (series.length < 2) return null;

    const count = series.length;
    const segments = buildSegments(series);
    const midY = yOf(50).toFixed(1);
    const homeAbbr = homeMark?.abbreviation;
    const awayAbbr = awayMark?.abbreviation;

    const onMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const plotLeft = PAD_L / W;
        const plotRight = (W - PAD_R) / W;
        const clientX = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
        let t = (clientX / rect.width - plotLeft) / (plotRight - plotLeft);
        t = Math.max(0, Math.min(1, t));
        const index = Math.round(t * (count - 1));
        const left = (plotLeft + (index / (count - 1)) * (plotRight - plotLeft)) * rect.width;
        setHover({ index, left, width: rect.width });
    };

    const point = hover ? series[hover.index] : null;

    return (
        <Box sx={{ position: 'relative' }} onMouseMove={onMove} onMouseLeave={() => setHover(null)} onTouchMove={onMove}>
            <Box sx={{ position: 'absolute', top: 4, left: 2, display: 'flex', alignItems: 'center', gap: '3px', pointerEvents: 'none' }}>
                <TeamMark team={awayMark} size={16} /><Box component="span" sx={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700 }}>100%</Box>
            </Box>
            <Box sx={{ position: 'absolute', bottom: 22, left: 2, display: 'flex', alignItems: 'center', gap: '3px', pointerEvents: 'none' }}>
                <TeamMark team={homeMark} size={16} /><Box component="span" sx={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700 }}>100%</Box>
            </Box>
            <Box component="svg" viewBox={`0 0 ${W} ${H}`} sx={{ width: '100%', display: 'block' }}>
                {segments.map((segment, i) => {
                    const linePoints = segment.points.map((p) => `${p[0].toFixed(1)},${yOf(p[1]).toFixed(1)}`).join(' ');
                    const first = segment.points[0];
                    const last = segment.points[segment.points.length - 1];
                    return (
                        <polygon
                            key={i}
                            points={`${first[0].toFixed(1)},${midY} ${linePoints} ${last[0].toFixed(1)},${midY}`}
                            fill={segment.side === 1 ? homeColor : awayColor}
                            opacity="0.16"
                        />
                    );
                })}
                <line x1={PAD_L} x2={W - PAD_R} y1={midY} y2={midY} stroke="var(--text-dim)" strokeDasharray="4 4" />
                {quarterMarks.map((mark) => {
                    const x = xOf(mark.index, count);
                    return (
                        <g key={mark.index}>
                            <line x1={x.toFixed(1)} x2={x.toFixed(1)} y1={PAD_T} y2={H - PAD_B} stroke="var(--line)" strokeDasharray="3 3" opacity="0.6" />
                            <text x={x.toFixed(1)} y={H - 6} textAnchor="middle" fill="var(--text-dim)" fontSize="9" fontWeight="700">{mark.label}</text>
                        </g>
                    );
                })}
                {segments.map((segment, i) => (
                    <polyline key={i} points={segment.points.map((p) => `${p[0].toFixed(1)},${yOf(p[1]).toFixed(1)}`).join(' ')} fill="none" stroke={segment.side === 1 ? homeColor : awayColor} strokeWidth="2.6" />
                ))}
            </Box>
            {point && (
                <>
                    <Box sx={{ position: 'absolute', top: 8, bottom: 26, width: '1px', background: 'var(--brand)', left: `${hover.left}px`, pointerEvents: 'none' }} />
                    <Box sx={{ position: 'absolute', top: 4, left: `${Math.min(hover.left + 10, hover.width - 130)}px`, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', px: 1, py: 0.75, fontSize: '0.66rem', lineHeight: 1.4, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', color: 'var(--text)' }}>
                        <b>Q{point.quarter} {point.clock}</b><br />
                        {awayAbbr} {point.awayScore} - {point.homeScore} {homeAbbr}<br />
                        Win Prob: {Math.max(point.homeWinProb, 100 - point.homeWinProb)}% {point.homeWinProb >= 50 ? homeAbbr : awayAbbr}
                    </Box>
                </>
            )}
        </Box>
    );
};

WinProbChart.propTypes = {
    series: PropTypes.array.isRequired,
    homeColor: PropTypes.string.isRequired,
    awayColor: PropTypes.string.isRequired,
    homeMark: PropTypes.object,
    awayMark: PropTypes.object,
    quarterMarks: PropTypes.array.isRequired,
};

export default WinProbChart;
