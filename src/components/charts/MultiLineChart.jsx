import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const W = 760;

const MultiLineChart = ({ lines, height = 320, yMin, yMax, invert = false, yTicks, label, padL = 34, padR = 14, padT = 16, padB = 16 }) => {
    const wrapRef = useRef(null);
    const [hover, setHover] = useState(null);
    const H = height;

    const allX = [...new Set(lines.flatMap((l) => l.pts.map((p) => p.x)))].sort((a, b) => a - b);
    const x0 = allX[0] ?? 0;
    const x1 = allX[allX.length - 1] ?? 1;
    const X = (v) => padL + (x1 === x0 ? 0.5 : (v - x0) / (x1 - x0)) * (W - padL - padR);
    const Y = (v) => (invert
        ? padT + ((v - yMin) / (yMax - yMin)) * (H - padT - padB)
        : H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB));

    const ticks = yTicks && yTicks.length ? yTicks : [0, 0.33, 0.66, 1].map((fr) => ({ v: yMin + fr * (yMax - yMin) }));

    const built = lines.map((l) => ({
        ...l,
        spts: l.pts.map((p) => ({ ...p, sx: X(p.x), sy: Y(p.val) })),
    }));

    const onMove = (event, li) => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const rect = wrap.getBoundingClientRect();
        const clientX = event.touches?.[0]?.clientX ?? event.clientX;
        const svgX = ((clientX - rect.left) / rect.width) * W;
        const line = built[li];
        let best = line.spts[0];
        line.spts.forEach((p) => {
            if (Math.abs(p.sx - svgX) < Math.abs(best.sx - svgX)) best = p;
        });
        setHover({
            color: line.color,
            team: line.team,
            text: label ? label(best) : `${best.val}`,
            px: (best.sx / W) * rect.width,
            py: (best.sy / H) * rect.height,
            width: rect.width,
        });
    };

    let tipLeft = 0;
    let tipTop = 0;
    if (hover) {
        tipLeft = Math.max(2, hover.px + 12);
        tipTop = Math.max(2, hover.py - 34);
    }

    return (
        <Box ref={wrapRef} sx={{ position: 'relative' }}>
            <Box component="svg" viewBox={`0 0 ${W} ${H}`} width="100%" sx={{ display: 'block' }}>
                {ticks.map((tk, i) => {
                    const yy = Y(tk.v);
                    return (
                        <g key={i}>
                            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke="var(--line-soft)" />
                            {tk.label != null && <text x="6" y={yy + 3} fill="var(--text-dim)" fontSize="10">{tk.label}</text>}
                        </g>
                    );
                })}
                {built.map((l) => (
                    <g key={l.team}>
                        <polyline points={l.spts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ')} fill="none" stroke={l.color} strokeWidth="2.4" />
                        <circle cx={l.spts[l.spts.length - 1].sx} cy={l.spts[l.spts.length - 1].sy} r="3.2" fill={l.color} />
                    </g>
                ))}
                {built.map((l, li) => (
                    <polyline
                        key={`hit-${l.team}`}
                        points={l.spts.map((p) => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ')}
                        fill="none"
                        stroke="transparent"
                        strokeWidth="16"
                        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                        onMouseMove={(e) => onMove(e, li)}
                        onTouchMove={(e) => onMove(e, li)}
                        onMouseLeave={() => setHover(null)}
                    />
                ))}
            </Box>
            {hover && (
                <>
                    <Box sx={{ position: 'absolute', width: '10px', height: '10px', borderRadius: '50%', transform: 'translate(-50%,-50%)', border: '2px solid var(--surface)', zIndex: 4, background: hover.color, left: `${hover.px}px`, top: `${hover.py}px` }} />
                    <Box sx={{ position: 'absolute', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '6px 9px', fontSize: '0.68rem', lineHeight: 1.45, whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', zIndex: 5, color: 'var(--text)', pointerEvents: 'none', left: `${tipLeft}px`, top: `${tipTop}px` }}>
                        <b style={{ color: hover.color }}>{hover.team}</b>
                        <br />
                        {hover.text}
                    </Box>
                </>
            )}
        </Box>
    );
};

MultiLineChart.propTypes = {
    lines: PropTypes.arrayOf(PropTypes.shape({
        team: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        pts: PropTypes.arrayOf(PropTypes.shape({ x: PropTypes.number, val: PropTypes.number })).isRequired,
    })).isRequired,
    height: PropTypes.number,
    yMin: PropTypes.number.isRequired,
    yMax: PropTypes.number.isRequired,
    invert: PropTypes.bool,
    yTicks: PropTypes.array,
    label: PropTypes.func,
    padL: PropTypes.number,
    padR: PropTypes.number,
    padT: PropTypes.number,
    padB: PropTypes.number,
};

export default MultiLineChart;
