import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useColorMode } from '../../../theme/ColorModeContext';
import { ordinalDown, formatDownDistanceSpot, describePlay } from '../../../utils/formatPlay';
import { formatClock } from '../../../utils/gameDetail';

const YARD_MARKS = [10, 20, 30, 40, 50, 40, 30, 20, 10];
const MINOR_YARD_TICKS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
const FIELD_TOP_BAND = 26;
const NUMBER_CENTER_Y = 15;
const ROW_HEIGHT = 52;
const LABEL_OFFSET = 10;
const RESULT_OFFSET = 22;
const BAR_TOP_OFFSET = 30;
const BAR_HEIGHT = 14;
const PAD_BOTTOM = 6;
const PAD_SIDE = 6;
const END_ZONE_WIDTH = 66;
const END_ZONE_LOGO_MARGIN = 8;
const MIN_ROW_COUNT = 6;
const W = 800;
const YARD_NUMBER_FONT = '"Arial Narrow", Arial, sans-serif';

const fieldX = (pct) => PAD_SIDE + END_ZONE_WIDTH + (pct / 100) * (W - 2 * PAD_SIDE - 2 * END_ZONE_WIDTH);

const AVG_CHAR_WIDTH_FACTOR = 0.62;
const END_ZONE_LABEL_MARGIN = 16;
const END_ZONE_LOGO_GAP = 6;
const ROW_TEXT_WIDTH_FACTOR = 0.54;

const endZoneLabel = (mark, name, fontSize, availableHeight) => {
    if (!name) return name;
    const estimatedWidth = name.length * fontSize * AVG_CHAR_WIDTH_FACTOR;
    if (estimatedWidth <= availableHeight - END_ZONE_LABEL_MARGIN) return name;
    return mark?.abbreviation || name;
};

const endZoneLineLayout = (logoHref, label, fontSize, logoSize) => {
    const logoW = logoHref ? logoSize : 0;
    const textW = label ? label.length * fontSize * AVG_CHAR_WIDTH_FACTOR : 0;
    const gapW = logoHref && label ? END_ZONE_LOGO_GAP : 0;
    return { logoW, textW, gapW, totalW: logoW + gapW + textW };
};

const fitRowTextX = (desiredX, text, fontSize) => {
    const estimatedWidth = text.length * fontSize * ROW_TEXT_WIDTH_FACTOR;
    return Math.min(desiredX, W - PAD_SIDE - estimatedWidth);
};

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

    const H = FIELD_TOP_BAND + Math.max(rows.length, MIN_ROW_COUNT) * ROW_HEIGHT + PAD_BOTTOM;
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
    const endZoneFontSize = Math.min(26, Math.max(12, H * 0.05)) * 1.15;
    const endZoneLogoSize = Math.min(END_ZONE_WIDTH - END_ZONE_LOGO_MARGIN * 2, endZoneFontSize * 1.69);
    const offenseEndZoneLogo = resolveLogo(offenseMark, mode);
    const defenseEndZoneLogo = resolveLogo(defenseMark, mode);
    const offenseLogoReserved = offenseEndZoneLogo ? endZoneLogoSize + END_ZONE_LOGO_GAP : 0;
    const defenseLogoReserved = defenseEndZoneLogo ? endZoneLogoSize + END_ZONE_LOGO_GAP : 0;
    const offenseLabel = endZoneLabel(offenseMark, offenseName, endZoneFontSize, H - offenseLogoReserved);
    const defenseLabel = endZoneLabel(defenseMark, defenseName, endZoneFontSize, H - defenseLogoReserved);
    const offenseColX = PAD_SIDE;
    const defenseColX = W - PAD_SIDE - END_ZONE_WIDTH;
    const offenseLine = endZoneLineLayout(offenseEndZoneLogo, offenseLabel, endZoneFontSize, endZoneLogoSize);
    const defenseLine = endZoneLineLayout(defenseEndZoneLogo, defenseLabel, endZoneFontSize, endZoneLogoSize);

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
                <line x1={PAD_SIDE + END_ZONE_WIDTH} x2={PAD_SIDE + END_ZONE_WIDTH} y1={0} y2={H} stroke="#fff" strokeWidth="2" />
                <line x1={W - PAD_SIDE - END_ZONE_WIDTH} x2={W - PAD_SIDE - END_ZONE_WIDTH} y1={0} y2={H} stroke="#fff" strokeWidth="2" />
                <line x1={PAD_SIDE} x2={PAD_SIDE} y1={0} y2={H} stroke="#fff" strokeWidth="3" />
                <line x1={W - PAD_SIDE} x2={W - PAD_SIDE} y1={0} y2={H} stroke="#fff" strokeWidth="3" />
                <line x1={PAD_SIDE} x2={W - PAD_SIDE} y1={0} y2={0} stroke="#fff" strokeWidth="3" />
                <line x1={PAD_SIDE} x2={W - PAD_SIDE} y1={H} y2={H} stroke="#fff" strokeWidth="3" />
                <g transform={`translate(${offenseColX + END_ZONE_WIDTH / 2} ${H / 2}) rotate(-90)`}>
                    {offenseEndZoneLogo && (
                        <image
                            href={offenseEndZoneLogo}
                            x={-offenseLine.totalW / 2}
                            y={-endZoneLogoSize / 2}
                            width={endZoneLogoSize}
                            height={endZoneLogoSize}
                            preserveAspectRatio="xMidYMid meet"
                        />
                    )}
                    {offenseLabel && (
                        <text
                            x={-offenseLine.totalW / 2 + offenseLine.logoW + offenseLine.gapW}
                            y={0}
                            dominantBaseline="central"
                            fill="rgba(255,255,255,0.9)"
                            fontSize={endZoneFontSize}
                            fontWeight="800"
                            letterSpacing="0.05em"
                        >
                            {offenseLabel}
                        </text>
                    )}
                </g>
                <g transform={`translate(${defenseColX + END_ZONE_WIDTH / 2} ${H / 2}) rotate(90)`}>
                    {defenseEndZoneLogo && (
                        <image
                            href={defenseEndZoneLogo}
                            x={-defenseLine.totalW / 2}
                            y={-endZoneLogoSize / 2}
                            width={endZoneLogoSize}
                            height={endZoneLogoSize}
                            preserveAspectRatio="xMidYMid meet"
                        />
                    )}
                    {defenseLabel && (
                        <text
                            x={-defenseLine.totalW / 2 + defenseLine.logoW + defenseLine.gapW}
                            y={0}
                            dominantBaseline="central"
                            fill="rgba(255,255,255,0.9)"
                            fontSize={endZoneFontSize}
                            fontWeight="800"
                            letterSpacing="0.05em"
                        >
                            {defenseLabel}
                        </text>
                    )}
                </g>

                {driveLogo && (
                    <image
                        href={driveLogo}
                        x={fieldCenterX - logoSize / 2}
                        y={H / 2 - logoSize / 2}
                        width={logoSize}
                        height={logoSize}
                        opacity={0.12}
                        preserveAspectRatio="xMidYMid meet"
                    />
                )}

                {MINOR_YARD_TICKS.map((pct) => {
                    const x = fieldX(pct);
                    return <line key={pct} x1={x} x2={x} y1={0} y2={H} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />;
                })}

                {YARD_MARKS.map((mark, index) => {
                    const pct = (index + 1) * 10;
                    const x = fieldX(pct);
                    const isLeftHalf = pct < 50;
                    const isMidfield = pct === 50;
                    return (
                        <g key={index}>
                            <line x1={x} x2={x} y1={0} y2={H} stroke="rgba(255,255,255,0.32)" strokeWidth="1" />
                            <text
                                x={x}
                                y={NUMBER_CENTER_Y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="rgba(255,255,255,0.75)"
                                fontSize="19"
                                fontWeight="700"
                                letterSpacing="1"
                                fontFamily={YARD_NUMBER_FONT}
                            >
                                {mark}
                            </text>
                            {!isMidfield && (
                                <polygon
                                    points={isLeftHalf
                                        ? `${x - 16},${NUMBER_CENTER_Y - 5} ${x - 16},${NUMBER_CENTER_Y + 5} ${x - 23},${NUMBER_CENTER_Y}`
                                        : `${x + 16},${NUMBER_CENTER_Y - 5} ${x + 16},${NUMBER_CENTER_Y + 5} ${x + 23},${NUMBER_CENTER_Y}`}
                                    fill="rgba(255,255,255,0.5)"
                                />
                            )}
                        </g>
                    );
                })}

                {rows.map((row, index) => {
                    const rowTop = FIELD_TOP_BAND + index * ROW_HEIGHT;
                    const barY = rowTop + BAR_TOP_OFFSET;
                    const labelY = rowTop + LABEL_OFFSET;
                    const resultY = rowTop + RESULT_OFFSET;
                    const x1 = fieldX(Math.min(row.startAbs, row.endAbs));
                    const x2 = fieldX(Math.max(row.startAbs, row.endAbs));
                    const isLast = index === rows.length - 1;
                    const isScore = isLast && isTouchdownDrive;
                    const barColor = isScore ? '#5fd97a' : driveColor;
                    const clockText = formatClock(row.play.clock);
                    const downDistanceText = row.play.down ? `${ordinalDown(row.play.down)} & ${row.play.yards_to_go}` : '';
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
                            <text x={fitRowTextX(barX, label, 11)} y={labelY} fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.92)">{label}</text>
                            <text x={fitRowTextX(barX, resultText, 10)} y={resultY} fontSize="10" fontWeight="600" fill={isScore ? '#5fd97a' : 'rgba(255,255,255,0.78)'}>{resultText}</text>
                            <rect x={barX} y={barY} width={Math.max(3, Math.abs(x2 - x1))} height={BAR_HEIGHT} rx={4} fill={barColor} opacity={hoverIndex === index ? 1 : 0.9} stroke={hoverIndex === index ? '#fff' : 'none'} strokeWidth="1.5" />
                        </g>
                    );
                })}
            </Box>
            {hoverRow && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: `${((FIELD_TOP_BAND + hoverIndex * ROW_HEIGHT) / H) * 100}%`,
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
