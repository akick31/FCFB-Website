import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useGameField } from '../../../hooks/useGameField';
import { pickMatchupColors } from '../../../utils/chartColor';
import { ordinalDown, formatDownDistanceSpot, describePlay } from '../../../utils/formatPlay';
import { formatClock } from '../../../utils/gameDetail';

const FIELD_TOP_BAND = 26;
const MAX_ROW_HEIGHT = 30;
const MIN_ROW_HEIGHT = 22;
const TEXT_BASELINE = 0.42;
const BAR_TOP = 0.56;
const BAR_SHARE = 0.32;
const MIN_FONT_SIZE = 9;
const FONT_SHARE = 0.34;
const PAD_BOTTOM = 6;
const MIN_ROW_COUNT = 10;
const BORDER_WIDTH = 3;
const BASE_WIDTH = 800;
const FALLBACK_TURF = '#1a5c2a';
const ROW_TEXT_WIDTH_FACTOR = 0.54;
const TEXT_HALO = { stroke: 'rgba(0,0,0,0.55)', strokeWidth: 3, paintOrder: 'stroke', strokeLinejoin: 'round' };

const fitRowTextX = (desiredX, text, fontSize, width) => {
    const estimatedWidth = text.length * fontSize * ROW_TEXT_WIDTH_FACTOR;
    return Math.min(desiredX, width - BORDER_WIDTH - estimatedWidth);
};

const DriveFieldChart = ({ drive = null, gameId = null, homeMark, awayMark }) => {
    const field = useGameField(gameId);
    const [hoverIndex, setHoverIndex] = useState(null);
    if (!drive || drive.plays.length === 0) {
        return null;
    }

    const homeTeam = homeMark?.name;
    const awayTeam = awayMark?.name;
    const offenseIsHome = drive.possession === 'HOME';

    const rowCount = Math.max(drive.plays.length, MIN_ROW_COUNT);
    const naturalHeight = field ? (field.height * BASE_WIDTH) / field.width : null;
    const fittedRowHeight = naturalHeight ? (naturalHeight - FIELD_TOP_BAND - PAD_BOTTOM) / rowCount : MAX_ROW_HEIGHT;
    const rowHeight = Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, fittedRowHeight));
    const fontSize = Math.max(MIN_FONT_SIZE, rowHeight * FONT_SHARE);
    const neededHeight = FIELD_TOP_BAND + rowCount * rowHeight + PAD_BOTTOM;
    const zoom = field ? Math.max(1, neededHeight / naturalHeight) : 1;
    const width = BASE_WIDTH * zoom;
    const H = field ? naturalHeight * zoom : neededHeight;
    const imageScale = field ? width / field.width : 1;
    const endZoneWidth = field ? field.margin * imageScale : 0;
    const fieldSpan = width - 2 * endZoneWidth;
    const fieldX = (abs) => endZoneWidth + ((offenseIsHome ? abs : 100 - abs) / 100) * fieldSpan;

    const rows = drive.plays.map((play) => {
        const startAbs = play.ball_location;
        const endAbs = Math.max(0, Math.min(100, play.ball_location + (play.yards || 0)));
        return { play, startAbs, endAbs };
    });

    const { home: homeColor, away: awayColor } = pickMatchupColors(homeMark, awayMark, FALLBACK_TURF);
    const driveColor = offenseIsHome ? homeColor : awayColor;
    const isTouchdownDrive = drive.outcome.startsWith('Touchdown');
    const hoverRow = hoverIndex != null ? rows[hoverIndex] : null;

    return (
        <Box sx={{ position: 'relative' }}>
            <Box
                component="svg"
                viewBox={`0 0 ${width} ${H}`}
                preserveAspectRatio="none"
                sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    background: FALLBACK_TURF,
                    borderRadius: 'var(--r-sm)',
                }}
            >
                {field && <image href={field.url} x={0} y={0} width={width} height={H} preserveAspectRatio="none" />}
                <rect
                    x={BORDER_WIDTH / 2}
                    y={BORDER_WIDTH / 2}
                    width={width - BORDER_WIDTH}
                    height={H - BORDER_WIDTH}
                    fill="none"
                    stroke={driveColor}
                    strokeWidth={BORDER_WIDTH}
                />
                {rows.map((row, index) => {
                    const rowTop = FIELD_TOP_BAND + index * rowHeight;
                    const barY = rowTop + rowHeight * BAR_TOP;
                    const textY = rowTop + rowHeight * TEXT_BASELINE;
                    const x1 = fieldX(row.startAbs);
                    const x2 = fieldX(row.endAbs);
                    const isLast = index === rows.length - 1;
                    const isScore = isLast && isTouchdownDrive;
                    const barColor = isScore ? '#5fd97a' : driveColor;
                    const clockText = formatClock(row.play.clock);
                    const downDistanceText = row.play.down
                        ? `${ordinalDown(row.play.down)} & ${row.play.yards_to_go}`
                        : '';
                    const label = [clockText, downDistanceText].filter(Boolean).join(' - ');
                    const resultText = describePlay(row.play, { homeName: homeTeam, awayName: awayTeam });
                    const barX = Math.min(x1, x2);
                    return (
                        <g
                            key={row.play.play_id}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex((prev) => (prev === index ? null : prev))}
                            style={{ cursor: 'pointer' }}
                        >
                            <text
                                x={fitRowTextX(barX, `${label}  ${resultText}`, fontSize, width)}
                                y={textY}
                                fontSize={fontSize}
                                fontWeight="700"
                                fill={isScore ? '#5fd97a' : 'rgba(255,255,255,0.95)'}
                                {...TEXT_HALO}
                            >
                                <tspan fontWeight="800">{label}</tspan>
                                {`  ${resultText}`}
                            </text>
                            <rect
                                x={barX}
                                y={barY}
                                width={Math.max(3, Math.abs(x2 - x1))}
                                height={rowHeight * BAR_SHARE}
                                rx={3}
                                fill={barColor}
                                stroke={hoverIndex === index ? '#fff' : 'rgba(0,0,0,0.45)'}
                                strokeWidth="1.5"
                                opacity={hoverIndex === index ? 1 : 0.92}
                            />
                        </g>
                    );
                })}
            </Box>
            {hoverRow && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: `${((FIELD_TOP_BAND + hoverIndex * rowHeight) / H) * 100}%`,
                        left: `${(Math.min(fieldX(hoverRow.startAbs), fieldX(hoverRow.endAbs)) / width) * 100}%`,
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
    gameId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    homeMark: PropTypes.object,
    awayMark: PropTypes.object,
};

export default DriveFieldChart;
