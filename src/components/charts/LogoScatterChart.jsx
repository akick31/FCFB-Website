import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const W = 760;
const H = 440;
const PAD = 48;
const BASE_VB = [0, 0, W, H];

const LogoScatterChart = ({ points, xLabel, yLabel, invertX = false, resetKey }) => {
    const svgRef = useRef(null);
    const wrapRef = useRef(null);
    const dragRef = useRef(null);
    const [vb, setVb] = useState(BASE_VB);
    const [hover, setHover] = useState(null);

    const showHover = (e, p) => {
        if (dragRef.current) return;
        const wrap = wrapRef.current;
        if (!wrap) return;
        const r = wrap.getBoundingClientRect();
        setHover({ team: p.team, x: p.x, y: p.y, left: e.clientX - r.left, top: e.clientY - r.top });
    };

    useEffect(() => {
        setVb(BASE_VB);
    }, [resetKey]);

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    let x0 = Math.min(...xs);
    let x1 = Math.max(...xs);
    let y0 = Math.min(...ys);
    let y1 = Math.max(...ys);
    const mxp = (x1 - x0) * 0.06 || 1;
    const myp = (y1 - y0) * 0.06 || 1;
    x0 -= mxp; x1 += mxp; y0 -= myp; y1 += myp;
    const X = (v) => (invertX ? PAD + ((x1 - v) / (x1 - x0)) * (W - 2 * PAD) : PAD + ((v - x0) / (x1 - x0)) * (W - 2 * PAD));
    const Y = (v) => H - PAD - ((v - y0) / (y1 - y0)) * (H - 2 * PAD);

    const onWheel = (e) => {
        e.preventDefault();
        const svg = svgRef.current;
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        const mx = vb[0] + ((e.clientX - r.left) / r.width) * vb[2];
        const my = vb[1] + ((e.clientY - r.top) / r.height) * vb[3];
        const f = e.deltaY < 0 ? 0.86 : 1.16;
        const w = Math.max(120, Math.min(1600, vb[2] * f));
        const h = Math.max(70, Math.min(920, vb[3] * f));
        setVb([mx - (mx - vb[0]) * (w / vb[2]), my - (my - vb[1]) * (h / vb[3]), w, h]);
    };

    const onDown = (e) => {
        dragRef.current = { x: e.clientX, y: e.clientY, vb: vb.slice() };
    };

    useEffect(() => {
        const onMove = (e) => {
            const drag = dragRef.current;
            const svg = svgRef.current;
            if (!drag || !svg) return;
            const r = svg.getBoundingClientRect();
            setVb([
                drag.vb[0] - ((e.clientX - drag.x) / r.width) * drag.vb[2],
                drag.vb[1] - ((e.clientY - drag.y) / r.height) * drag.vb[3],
                drag.vb[2],
                drag.vb[3],
            ]);
        };
        const onUp = () => { dragRef.current = null; };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, []);

    const grid = [0, 0.25, 0.5, 0.75, 1];

    return (
        <Box ref={wrapRef} sx={{ position: 'relative' }}>
        <Box
            component="svg"
            ref={svgRef}
            viewBox={vb.join(' ')}
            width="100%"
            onWheel={onWheel}
            onMouseDown={onDown}
            sx={{ display: 'block', cursor: 'grab', touchAction: 'none' }}
        >
            {grid.map((f) => (
                <g key={f}>
                    <line x1={PAD} x2={W - PAD} y1={PAD + f * (H - 2 * PAD)} y2={PAD + f * (H - 2 * PAD)} stroke="var(--line-soft)" />
                    <line y1={PAD} y2={H - PAD} x1={PAD + f * (W - 2 * PAD)} x2={PAD + f * (W - 2 * PAD)} stroke="var(--line-soft)" />
                </g>
            ))}
            <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="var(--line)" />
            <line x1={PAD} x2={PAD} y1={PAD} y2={H - PAD} stroke="var(--line)" />
            <text x={W / 2} y={H - 14} textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontWeight="700">{xLabel}</text>
            <text x="16" y={H / 2} textAnchor="middle" fill="var(--text-dim)" fontSize="11" fontWeight="700" transform={`rotate(-90 16 ${H / 2})`}>{yLabel}</text>
            {points.map((p) => {
                const cx = X(p.x);
                const cy = Y(p.y);
                const handlers = {
                    onMouseEnter: (e) => showHover(e, p),
                    onMouseMove: (e) => showHover(e, p),
                    onMouseLeave: () => setHover(null),
                    style: { cursor: 'pointer' },
                };
                return p.logo ? (
                    <image key={p.team} href={p.logo} x={cx - 11} y={cy - 11} width="22" height="22" {...handlers} />
                ) : (
                    <circle key={p.team} cx={cx} cy={cy} r="6" fill={p.color || 'var(--brand)'} {...handlers} />
                );
            })}
        </Box>
        {hover && (
            <Box sx={{ position: 'absolute', left: `${hover.left + 12}px`, top: `${Math.max(2, hover.top - 34)}px`, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '6px 9px', fontSize: '0.68rem', lineHeight: 1.45, whiteSpace: 'nowrap', boxShadow: 'var(--shadow)', color: 'var(--text)', pointerEvents: 'none', zIndex: 5 }}>
                <b>{hover.team}</b>
                <br />
                {`${xLabel}: ${hover.x}, ${yLabel}: ${hover.y}`}
            </Box>
        )}
        </Box>
    );
};

LogoScatterChart.propTypes = {
    points: PropTypes.arrayOf(PropTypes.shape({
        team: PropTypes.string.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        logo: PropTypes.string,
        color: PropTypes.string,
    })).isRequired,
    xLabel: PropTypes.string.isRequired,
    yLabel: PropTypes.string.isRequired,
    invertX: PropTypes.bool,
    resetKey: PropTypes.any,
};

export default LogoScatterChart;
