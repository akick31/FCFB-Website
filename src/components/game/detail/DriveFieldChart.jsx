import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useColorMode } from '../../../theme/ColorModeContext';
import { ordinalDown, formatDownDistanceSpot, describePlay } from '../../../utils/formatPlay';

const YARD_MARKS = [10, 20, 30, 40, 50, 40, 30, 20, 10];
const ROW_HEIGHT = 36;
const LABEL_OFFSET = 10;
const BAR_HEIGHT = 18;
const PAD_TOP = 24;
const PAD_BOTTOM = 6;
const PAD_SIDE = 6;
const END_ZONE_WIDTH = 80;
const W = 800;

const fieldX = (pct) => PAD_SIDE + END_ZONE_WIDTH + (pct / 100) * (W - 2 * PAD_SIDE - 2 * END_ZONE_WIDTH);

const resolveLogo = (mark, mode) => {
    const candidates = mode === 'dark' ? [mark?.logoDark, mark?.logo] : [mark?.logo, mark?.logoDark];
    return candidates.find(Boolean) || null;
};

const luminance = (hex) => {
    if (!hex) return 1;
    let value = String(hex).replace('#', '');
    if (value.length === 3) value = value.split('').map((c) => c + c).join('');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const endZoneFill = (mark) => {
    const primary = mark?.primaryColor;
    const secondary = mark?.secondaryColor;
    if (primary && luminance(primary) < 0.88) return primary;
    if (secondary && luminance(secondary) < 0.88) return secondary;
    return primary || secondary || '#2a2a2a';
};

const DriveFieldChart = ({ drive = null, homeMark, awayMark, homeColor, awayColor }) => {
    const { mode } = useColorMode();
    const [hoverIndex, setHoverIndex] = useState(null);
    if (!drive || drive.plays.length === 0) return null;

    const homeTeam = homeMark?.name;
    const awayTeam = awayMark?.name;

    const rows = drive.plays.map((play) => {
        const startAbs = play.ball_location;
        const endAbs = Math.max(0, Math.min(100, play.ball_location + (play.yards || 0)));
        return { play, startAbs, endAbs };
    });

    const H = PAD_TOP + rows.length * ROW_HEIGHT + PAD_BOTTOM;
    const offenseMark = drive.possession === 'HOME' ? homeMark : awayMark;
    const defenseMark = drive.possession === 'HOME' ? awayMark : homeMark;
    const offenseName = drive.possession === 'HOME' ? homeTeam : awayTeam;
    const defenseName = drive.possession === 'HOME' ? awayTeam : homeTeam;
    const driveColor = drive.possession === 'HOME' ? homeColor : awayColor;
    const isTouchdownDrive = drive.outcome.startsWith('Touchdown');
    const hoverRow = hoverIndex != null ? rows[hoverIndex] : null;

    const driveLogo = resolveLogo(offenseMark, mode);
    const logoSize = Math.min(H * 0.5, 120);
    const fieldCenterX = PAD_SIDE + END_ZONE_WIDTH + (W - 2 * PAD_SIDE - 2 * END_ZONE_WIDTH) / 2;

    return (
        <Box sx={{ position: 'relative' }}>
            <Box
                component="svg"
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                sx={{ width: '100%', height: 'auto', display: 'block', background: '#1a5c2a', borderRadius: 'var(--r-sm)' }}
            >
                <rect x={PAD_SIDE} y={0} width={END_ZONE_WIDTH} height={H} fill={endZoneFill(offenseMark)} />
                <rect x={W - PAD_SIDE - END_ZONE_WIDTH} y={0} width={END_ZONE_WIDTH} height={H} fill={endZoneFill(defenseMark)} />
                <text x={PAD_SIDE + END_ZONE_WIDTH / 2} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="13" fontWeight="800" letterSpacing="0.05em" transform={`rotate(-90 ${PAD_SIDE + END_ZONE_WIDTH / 2} ${H / 2})`}>{offenseName}</text>
                <text x={W - PAD_SIDE - END_ZONE_WIDTH / 2} y={H / 2} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="13" fontWeight="800" letterSpacing="0.05em" transform={`rotate(90 ${W - PAD_SIDE - END_ZONE_WIDTH / 2} ${H / 2})`}>{defenseName}</text>

                {driveLogo && (
                    <image
                        href={driveLogo}
                        x={fieldCenterX - logoSize / 2}
                        y={H / 2 - logoSize / 2}
                        width={logoSize}
                        height={logoSize}
                        opacity={0.85}
                        preserveAspectRatio="xMidYMid meet"
                    />
                )}

                {YARD_MARKS.map((mark, index) => {
                    const pct = (index / (YARD_MARKS.length - 1)) * 100;
                    const x = fieldX(pct);
                    return (
                        <g key={index}>
                            <line x1={x} x2={x} y1={PAD_TOP} y2={H} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                            <text x={x} y={16} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700">{mark}</text>
                        </g>
                    );
                })}

                {rows.map((row, index) => {
                    const y = PAD_TOP + index * ROW_HEIGHT + LABEL_OFFSET + 6;
                    const labelY = PAD_TOP + index * ROW_HEIGHT + LABEL_OFFSET;
                    const x1 = fieldX(Math.min(row.startAbs, row.endAbs));
                    const x2 = fieldX(Math.max(row.startAbs, row.endAbs));
                    const isLast = index === rows.length - 1;
                    const barColor = isLast && isTouchdownDrive ? '#5fd97a' : driveColor;
                    const label = row.play.down ? `${ordinalDown(row.play.down)} & ${row.play.yards_to_go}` : '';
                    return (
                        <g
                            key={row.play.play_id}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex((prev) => (prev === index ? null : prev))}
                            style={{ cursor: 'pointer' }}
                        >
                            <text x={Math.min(x1, x2)} y={labelY} fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.92)">
                                {label}
                                {isLast && isTouchdownDrive && <tspan fill="#5fd97a"> · TD</tspan>}
                            </text>
                            <rect x={Math.min(x1, x2)} y={y} width={Math.max(3, Math.abs(x2 - x1))} height={BAR_HEIGHT} rx={4} fill={barColor} opacity={hoverIndex === index ? 1 : 0.9} stroke={hoverIndex === index ? '#fff' : 'none'} strokeWidth="1.5" />
                        </g>
                    );
                })}
            </Box>
            {hoverRow && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: `${((PAD_TOP + hoverIndex * ROW_HEIGHT) / H) * 100}%`,
                        left: `${(Math.min(hoverRow.startAbs, hoverRow.endAbs) / 100) * 60 + 20}%`,
                        transform: 'translateY(-100%)',
                        background: 'var(--surface-2)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--r-sm)',
                        px: 1,
                        py: 0.75,
                        fontSize: '0.68rem',
                        lineHeight: 1.4,
                        color: 'var(--text)',
                        boxShadow: 'var(--shadow)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                >
                    <Box component="b">{formatDownDistanceSpot(hoverRow.play, homeTeam, awayTeam)}</Box>
                    <br />
                    {describePlay(hoverRow.play, { homeName: homeTeam, awayName: awayTeam })}
                </Box>
            )}
        </Box>
    );
};

DriveFieldChart.propTypes = {
    drive: PropTypes.shape({
        possession: PropTypes.string,
        outcome: PropTypes.string,
        plays: PropTypes.array,
    }),
    homeMark: PropTypes.object,
    awayMark: PropTypes.object,
    homeColor: PropTypes.string.isRequired,
    awayColor: PropTypes.string.isRequired,
};

export default DriveFieldChart;
