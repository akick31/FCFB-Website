import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
} from 'recharts';
import { Box, Typography, Paper, Avatar, IconButton, Tooltip as MuiTooltip, useTheme, useMediaQuery } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

const ScatterPlotChart = ({ 
    data, 
    teams = [], 
    xAxisLabel, 
    yAxisLabel, 
    title,
    xDataKey = 'offense',
    yDataKey = 'defense',
    reversedX = false,
    reversedY = false,
    resetZoomKey = 0,
}) => {
    const [zoomDomain, setZoomDomain] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPointer, setLastPointer] = useState(null);
    const [isPinching, setIsPinching] = useState(false);
    const [lastPinchDistance, setLastPinchDistance] = useState(null);

    const zoomDomainRef = useRef(zoomDomain);
    const containerRef = useRef(null);

    useEffect(() => {
        zoomDomainRef.current = zoomDomain;
    }, [zoomDomain]);

    useEffect(() => {
        setZoomDomain({ x: null, y: null });
        setIsDragging(false);
        setIsPinching(false);
    }, [resetZoomKey]);

    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(team => {
            if (team.name) {
                map[team.name] = {
                    logo: team.logo || null,
                    name: team.name,
                    abbreviation: team.abbreviation || team.name?.substring(0, 3).toUpperCase(),
                    primaryColor: team.primaryColor || team.primary_color || '#1976d2',
                };
            }
        });
        return map;
    }, [teams]);

    const isSuccessRate = useMemo(() => {
        return xDataKey.includes('success') || yDataKey.includes('success') || 
               xDataKey.includes('ThirdFourth') || yDataKey.includes('ThirdFourth');
    }, [xDataKey, yDataKey]);

    const { xMedian, yMedian } = useMemo(() => {
        if (!data || data.length === 0) return { xMedian: 0, yMedian: 0 };
        
        const getMedian = (values) => {
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 0 
                ? (sorted[mid - 1] + sorted[mid]) / 2 
                : sorted[mid];
        };
        
        const xValues = data.map(d => d[xDataKey]).filter(v => v != null && isFinite(v));
        const yValues = data.map(d => d[yDataKey]).filter(v => v != null && isFinite(v));
        
        return {
            xMedian: xValues.length > 0 ? getMedian(xValues) : 0,
            yMedian: yValues.length > 0 ? getMedian(yValues) : 0,
        };
    }, [data, xDataKey, yDataKey]);

    const baseRanges = useMemo(() => {
        if (!data || data.length === 0) {
            return { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };
        }
        
        const xValues = data.map(d => d[xDataKey]).filter(v => v != null && isFinite(v));
        const yValues = data.map(d => d[yDataKey]).filter(v => v != null && isFinite(v));
        
        return {
            xMin: Math.min(...xValues),
            xMax: Math.max(...xValues),
            yMin: Math.min(...yValues),
            yMax: Math.max(...yValues),
        };
    }, [data, xDataKey, yDataKey]);

    const generateTicks = useCallback((min, max, isPercentage) => {
        if (isPercentage) {
            const ticks = [];
            let tick = Math.floor(min * 20) / 20;
            const maxTick = Math.ceil(max * 20) / 20;
            while (tick <= maxTick) {
                ticks.push(parseFloat(tick.toFixed(2)));
                tick += 0.05;
            }
            return ticks;
        } else {
            const range = max - min;
            const step = range > 200 ? 40 : range > 100 ? 20 : range > 50 ? 10 : 5;
            const ticks = [];
            let tick = Math.floor(min / step) * step;
            const maxTick = Math.ceil(max / step) * step;
            while (tick <= maxTick) {
                ticks.push(tick);
                tick += step;
            }
            return ticks;
        }
    }, []);

    const { xDomain, yDomain, xTicks, yTicks } = useMemo(() => {
        if (!data || data.length === 0) {
            return { 
                xDomain: [0, 100], 
                yDomain: [0, 100], 
                xTicks: [], 
                yTicks: [] 
            };
        }

        const { xMin, xMax, yMin, yMax } = baseRanges;

        const calculateTightDomain = (min, max, isPercentage) => {
            const range = max - min;
            const padding = isPercentage ? 0.02 : Math.max(range * 0.03, 1);
            
            let domainMin = min - padding;
            let domainMax = max + padding;
            
            if (isPercentage) {
                domainMin = Math.max(0, domainMin);
                domainMax = Math.min(1, domainMax);
            }
            
            return { domainMin, domainMax };
        };

        const xResult = calculateTightDomain(xMin, xMax, isSuccessRate);
        const yResult = calculateTightDomain(yMin, yMax, isSuccessRate);

        const xTicksArray = generateTicks(xResult.domainMin, xResult.domainMax, isSuccessRate);
        const yTicksArray = generateTicks(yResult.domainMin, yResult.domainMax, isSuccessRate);

        const finalXDomain = zoomDomain.x || [xResult.domainMin, xResult.domainMax];
        const finalYDomain = zoomDomain.y || [yResult.domainMin, yResult.domainMax];

        // FIXED: Strict tick filtering to prevent ticks outside domain
        const xDomainMin = Math.min(...finalXDomain);
        const xDomainMax = Math.max(...finalXDomain);
        const yDomainMin = Math.min(...finalYDomain);
        const yDomainMax = Math.max(...finalYDomain);

        const visibleXTicks = xTicksArray.filter(t => t >= xDomainMin && t <= xDomainMax);
        const visibleYTicks = yTicksArray.filter(t => t >= yDomainMin && t <= yDomainMax);

        return {
            xDomain: finalXDomain,
            yDomain: finalYDomain,
            xTicks: visibleXTicks,
            yTicks: visibleYTicks,
        };
    }, [data, baseRanges, isSuccessRate, zoomDomain, generateTicks]);

    const handleZoomIn = useCallback(() => {
        const currentXDomain = zoomDomain.x || [baseRanges.xMin, baseRanges.xMax];
        const currentYDomain = zoomDomain.y || [baseRanges.yMin, baseRanges.yMax];
        
        const xCenter = (currentXDomain[0] + currentXDomain[1]) / 2;
        const yCenter = (currentYDomain[0] + currentYDomain[1]) / 2;
        const xRange = (currentXDomain[1] - currentXDomain[0]) * 0.35;
        const yRange = (currentYDomain[1] - currentYDomain[0]) * 0.35;
        
        setZoomDomain({
            x: [xCenter - xRange, xCenter + xRange],
            y: [yCenter - yRange, yCenter + yRange],
        });
    }, [zoomDomain, baseRanges]);

    const handleZoomOut = useCallback(() => {
        const currentXDomain = zoomDomain.x || [baseRanges.xMin, baseRanges.xMax];
        const currentYDomain = zoomDomain.y || [baseRanges.yMin, baseRanges.yMax];
        
        const xCenter = (currentXDomain[0] + currentXDomain[1]) / 2;
        const yCenter = (currentYDomain[0] + currentYDomain[1]) / 2;
        const xRange = (currentXDomain[1] - currentXDomain[0]) * 1.4;
        const yRange = (currentYDomain[1] - currentYDomain[0]) * 1.4;
        
        const newXDomain = [xCenter - xRange / 2, xCenter + xRange / 2];
        const newYDomain = [yCenter - yRange / 2, yCenter + yRange / 2];
        
        const fullyZoomedOut = 
            newXDomain[0] <= baseRanges.xMin && 
            newXDomain[1] >= baseRanges.xMax && 
            newYDomain[0] <= baseRanges.yMin && 
            newYDomain[1] >= baseRanges.yMax;
        
        setZoomDomain(fullyZoomedOut ? { x: null, y: null } : { x: newXDomain, y: newYDomain });
    }, [zoomDomain, baseRanges]);

    const handleResetZoom = useCallback(() => {
        setZoomDomain({ x: null, y: null });
    }, []);

    // FIXED: Corrected vertical drag - drag down moves viewport up
    const handleDrag = useCallback((deltaX, deltaY, containerWidth, containerHeight) => {
        const currentXDomain = zoomDomainRef.current.x || [baseRanges.xMin, baseRanges.xMax];
        const currentYDomain = zoomDomainRef.current.y || [baseRanges.yMin, baseRanges.yMax];
        
        const xRange = currentXDomain[1] - currentXDomain[0];
        const yRange = currentYDomain[1] - currentYDomain[0];
        
        // Horizontal: drag right (+deltaX) = move viewport right (+panX)
        const panX = (deltaX / containerWidth) * xRange;
        // FIXED: Vertical: drag down (+deltaY) = move viewport up (+panY to show higher values)
        const panY = (deltaY / containerHeight) * yRange;
        
        const newXDomain = [currentXDomain[0] + panX, currentXDomain[1] + panX];
        const newYDomain = [currentYDomain[0] + panY, currentYDomain[1] + panY];
        
        const newZoom = { x: newXDomain, y: newYDomain };
        zoomDomainRef.current = newZoom;
        setZoomDomain(newZoom);
    }, [baseRanges]);

    const handleMouseDown = useCallback((e) => {
        if (!zoomDomain.x && !zoomDomain.y) return;
        
        const target = e.target;
        if (target.closest('button') || target.closest('[role="button"]')) return;
        
        e.preventDefault();
        setIsDragging(true);
        setLastPointer({ x: e.clientX, y: e.clientY });
    }, [zoomDomain]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !lastPointer || !containerRef.current) return;
        
        e.preventDefault();
        const deltaX = e.clientX - lastPointer.x;
        const deltaY = e.clientY - lastPointer.y;
        
        const rect = containerRef.current.getBoundingClientRect();
        handleDrag(deltaX, deltaY, rect.width, rect.height);
        
        setLastPointer({ x: e.clientX, y: e.clientY });
    }, [isDragging, lastPointer, handleDrag]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setLastPointer(null);
    }, []);

    const getTouchDistance = (touch1, touch2) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touch1, touch2) => {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        };
    };

    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            setIsPinching(true);
            setLastPinchDistance(getTouchDistance(e.touches[0], e.touches[1]));
        } else if (e.touches.length === 1 && (zoomDomain.x || zoomDomain.y)) {
            e.preventDefault();
            setIsDragging(true);
            setLastPointer({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    }, [zoomDomain]);

    const handleTouchMove = useCallback((e) => {
        if (isPinching && e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            
            if (lastPinchDistance) {
                const scale = currentDistance / lastPinchDistance;
                const currentXDomain = zoomDomainRef.current.x || [baseRanges.xMin, baseRanges.xMax];
                const currentYDomain = zoomDomainRef.current.y || [baseRanges.yMin, baseRanges.yMax];
                
                const center = getTouchCenter(e.touches[0], e.touches[1]);
                const rect = containerRef.current.getBoundingClientRect();
                
                const xRange = currentXDomain[1] - currentXDomain[0];
                const yRange = currentYDomain[1] - currentYDomain[0];
                const xRatio = (center.x - rect.left) / rect.width;
                const yRatio = (center.y - rect.top) / rect.height;
                const xCenter = currentXDomain[0] + xRange * xRatio;
                const yCenter = currentYDomain[0] + yRange * (1 - yRatio);
                
                const newXRange = xRange / scale;
                const newYRange = yRange / scale;
                const newXDomain = [xCenter - newXRange * xRatio, xCenter + newXRange * (1 - xRatio)];
                const newYDomain = [yCenter - newYRange * (1 - yRatio), yCenter + newYRange * yRatio];
                
                const newZoom = { x: newXDomain, y: newYDomain };
                zoomDomainRef.current = newZoom;
                setZoomDomain(newZoom);
            }
            
            setLastPinchDistance(currentDistance);
        } else if (isDragging && e.touches.length === 1 && lastPointer && containerRef.current) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - lastPointer.x;
            const deltaY = e.touches[0].clientY - lastPointer.y;
            
            const rect = containerRef.current.getBoundingClientRect();
            handleDrag(deltaX, deltaY, rect.width, rect.height);
            
            setLastPointer({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
    }, [isPinching, isDragging, lastPinchDistance, lastPointer, baseRanges, handleDrag]);

    const handleTouchEnd = useCallback(() => {
        setIsPinching(false);
        setIsDragging(false);
        setLastPinchDistance(null);
        setLastPointer(null);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const visibleData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (!zoomDomain.x && !zoomDomain.y) return data;
        
        const currentXDomain = zoomDomain.x || [baseRanges.xMin, baseRanges.xMax];
        const currentYDomain = zoomDomain.y || [baseRanges.yMin, baseRanges.yMax];
        
        return data.filter(point => {
            const xVal = point[xDataKey];
            const yVal = point[yDataKey];
            return xVal >= Math.min(...currentXDomain) && 
                   xVal <= Math.max(...currentXDomain) &&
                   yVal >= Math.min(...currentYDomain) && 
                   yVal <= Math.max(...currentYDomain);
        });
    }, [data, zoomDomain, baseRanges, xDataKey, yDataKey]);

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) return null;

        const point = payload[0].payload;
        const teamInfo = teamMap[point.team];

        return (
            <Paper sx={{ p: 2, border: '1px solid #ccc', maxWidth: 250 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {teamInfo?.logo && (
                        <Avatar src={teamInfo.logo} alt={teamInfo.name} sx={{ width: 32, height: 32 }} />
                    )}
                    <Typography variant="body2" fontWeight="bold">
                        {teamInfo?.name || point.team}
                    </Typography>
                </Box>
                <Typography variant="body2">
                    <strong>{xAxisLabel}:</strong>{' '}
                    {point[xDataKey] != null ? (isSuccessRate ? point[xDataKey].toFixed(2) : point[xDataKey].toFixed(1)) : 'N/A'}
                </Typography>
                <Typography variant="body2">
                    <strong>{yAxisLabel}:</strong>{' '}
                    {point[yDataKey] != null ? (isSuccessRate ? point[yDataKey].toFixed(2) : point[yDataKey].toFixed(1)) : 'N/A'}
                </Typography>
            </Paper>
        );
    };

    const CustomShape = ({ cx, cy, payload }) => {
        const teamInfo = teamMap[payload.team];
        
        if (!teamInfo?.logo) {
            return (
                <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill={teamInfo?.primaryColor || '#1976d2'}
                    stroke="#fff"
                    strokeWidth={2}
                />
            );
        }
        
        return (
            <image
                x={cx - 16}
                y={cy - 16}
                width={32}
                height={32}
                href={teamInfo.logo}
                preserveAspectRatio="xMidYMid meet"
            />
        );
    };

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No data available for {title}
                </Typography>
            </Paper>
        );
    }

    const isZoomed = zoomDomain.x !== null || zoomDomain.y !== null;
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // On mobile, fit to viewport width and use a height that fits on screen
    // Maintains aspect ratio while being fully visible
    const chartWidth = isMobile ? '100%' : '100%';
    const chartHeight = isMobile ? 400 : 500;

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{title}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <MuiTooltip title="Zoom In">
                        <IconButton size="small" onClick={handleZoomIn}>
                            <ZoomIn />
                        </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Zoom Out">
                        <IconButton size="small" onClick={handleZoomOut} disabled={!isZoomed}>
                            <ZoomOut />
                        </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Reset Zoom">
                        <IconButton size="small" onClick={handleResetZoom} disabled={!isZoomed}>
                            <FitScreen />
                        </IconButton>
                    </MuiTooltip>
                </Box>
            </Box>

            <Box
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={(e) => e.preventDefault()}
                sx={{
                    width: chartWidth,
                    height: chartHeight,
                    cursor: isZoomed ? (isDragging || isPinching ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none',
                    touchAction: 'none',
                }}
            >
                    <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        
                        <XAxis
                            type="number"
                            dataKey={xDataKey}
                            name={xAxisLabel}
                            label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }}
                            domain={xDomain}
                            ticks={xTicks}
                            reversed={reversedX}
                            allowDecimals={isSuccessRate}
                            tickFormatter={(value) => isSuccessRate ? value.toFixed(2) : value.toFixed(0)}
                        />
                        
                        <YAxis
                            type="number"
                            dataKey={yDataKey}
                            name={yAxisLabel}
                            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 15 }}
                            domain={yDomain}
                            ticks={yTicks}
                            reversed={reversedY}
                            allowDecimals={isSuccessRate}
                            width={60}
                            tickFormatter={(value) => isSuccessRate ? value.toFixed(2) : value.toFixed(0)}
                        />
                        
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        
                        <ReferenceLine
                            x={xMedian}
                            stroke="#e53935"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: 'Median', position: 'top', fill: '#e53935' }}
                        />
                        <ReferenceLine
                            y={yMedian}
                            stroke="#e53935"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: 'Median', position: 'right', fill: '#e53935' }}
                        />
                        
                        <Scatter name="Teams" data={visibleData} shape={<CustomShape />}>
                            {visibleData.map((entry, index) => (
                                <Cell key={`cell-${index}`} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default ScatterPlotChart;