import React, { useMemo, useState, useEffect, useRef } from 'react';
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
import { Box, Typography, Paper, Avatar, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

/**
 * Scatter Plot Chart Component
 * Displays team performance metrics as scatter plots with team logos
 */
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
    resetZoomKey = 0, // Key to reset zoom when chart changes
}) => {
    // Zoom state for scatter plots
    const [xZoomDomain, setXZoomDomain] = useState(null);
    const [yZoomDomain, setYZoomDomain] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    // Use refs to track current values for smooth dragging (avoid stale closures)
    const xZoomDomainRef = useRef(xZoomDomain);
    const yZoomDomainRef = useRef(yZoomDomain);
    const isDraggingRef = useRef(isDragging);
    const dragStartRef = useRef(dragStart);
    const baseDomainsRef = useRef({ xDomainMin: 0, xDomainMax: 100, yDomainMin: 0, yDomainMax: 100 });
    const rafIdRef = useRef(null);
    
    // Keep refs in sync with state
    useEffect(() => {
        xZoomDomainRef.current = xZoomDomain;
    }, [xZoomDomain]);
    
    useEffect(() => {
        yZoomDomainRef.current = yZoomDomain;
    }, [yZoomDomain]);
    
    useEffect(() => {
        isDraggingRef.current = isDragging;
    }, [isDragging]);
    
    useEffect(() => {
        dragStartRef.current = dragStart;
    }, [dragStart]);
    
    // Continuous RAF loop during drag for smooth updates
    useEffect(() => {
        if (isDragging) {
            const updateLoop = () => {
                if (isDraggingRef.current) {
                    // Update state from refs on every frame
                    setXZoomDomain(xZoomDomainRef.current);
                    setYZoomDomain(yZoomDomainRef.current);
                    rafIdRef.current = requestAnimationFrame(updateLoop);
                } else {
                    rafIdRef.current = null;
                }
            };
            rafIdRef.current = requestAnimationFrame(updateLoop);
            
            return () => {
                if (rafIdRef.current) {
                    cancelAnimationFrame(rafIdRef.current);
                    rafIdRef.current = null;
                }
            };
        } else {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }
    }, [isDragging]);
    
    // Reset zoom when chart changes
    useEffect(() => {
        setXZoomDomain(null);
        setYZoomDomain(null);
    }, [resetZoomKey]);
    // Build team map for logos and colors
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

    // Calculate median values for reference lines
    const { xMedian, yMedian } = useMemo(() => {
        if (!data || data.length === 0) return { xMedian: 0, yMedian: 0 };
        
        const xValues = data.map(d => d[xDataKey]).filter(v => v != null && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
        const yValues = data.map(d => d[yDataKey]).filter(v => v != null && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
        
        const getMedian = (arr) => {
            if (arr.length === 0) return 0;
            const mid = Math.floor(arr.length / 2);
            const median = arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
            return isFinite(median) ? median : 0;
        };
        
        return {
            xMedian: getMedian(xValues),
            yMedian: getMedian(yValues),
        };
    }, [data, xDataKey, yDataKey]);

    // Calculate domain with padding and rounded ticks
    const { xDomain, yDomain, xTicks, yTicks } = useMemo(() => {
        try {
            if (!data || data.length === 0) {
                return { xDomain: [0, 100], yDomain: [0, 100], xTicks: [], yTicks: [] };
            }
            
            const xValues = data.map(d => d[xDataKey]).filter(v => v != null && !isNaN(v) && isFinite(v));
            const yValues = data.map(d => d[yDataKey]).filter(v => v != null && !isNaN(v) && isFinite(v));
            
            if (xValues.length === 0 || yValues.length === 0) {
                return { xDomain: [0, 100], yDomain: [0, 100], xTicks: [], yTicks: [] };
            }
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        // Generate rounded ticks based on actual data range (not padded)
        // This ensures ticks don't extend unnecessarily far beyond the data
        const generateRoundedTicks = (dataMin, dataMax, isPercentage = false) => {
            if (isPercentage) {
                // For success rate (0-1 range), use 0.05 increments
                const ticks = [];
                let tick = Math.floor(dataMin * 20) / 20; // Round down to nearest 0.05
                const maxTick = Math.ceil(dataMax * 20) / 20; // Round up to nearest 0.05
                while (tick <= maxTick) {
                    ticks.push(parseFloat(tick.toFixed(2)));
                    tick += 0.05;
                }
                return { ticks, min: ticks[0], max: ticks[ticks.length - 1] };
            } else {
                // For average diff, use 20 increments (400, 380, 360, etc.)
                const range = dataMax - dataMin;
                const step = range > 200 ? 40 : range > 100 ? 20 : range > 50 ? 10 : 5;
                const ticks = [];
                // Round down to nearest step for min, round up for max to ensure all data is visible
                let tick = Math.floor(dataMin / step) * step; // Round down to nearest step
                const maxTick = Math.ceil(dataMax / step) * step; // Round up to nearest step
                while (tick <= maxTick) {
                    ticks.push(tick);
                    tick += step;
                }
                return { ticks, min: ticks[0], max: ticks[ticks.length - 1] };
            }
        };
        
        // Check if this is a success rate chart (includes 'success' or 'ThirdFourth' for 3rd/4th down)
        const isSuccessRate = xDataKey.includes('success') || yDataKey.includes('success') || 
                              xDataKey.includes('ThirdFourth') || yDataKey.includes('ThirdFourth');
        
        // Generate ticks based on actual data range
        const xTickResult = generateRoundedTicks(xMin, xMax, isSuccessRate);
        const yTickResult = generateRoundedTicks(yMin, yMax, isSuccessRate);
        
        // Calculate padding based on tick range (not data range) to ensure visual spacing
        const xTickRange = xTickResult.max - xTickResult.min;
        const yTickRange = yTickResult.max - yTickResult.min;
        const xPadding = xTickRange * 0.05 || 1; // Smaller padding, 5% of tick range
        const yPadding = yTickRange * 0.05 || 1;
        
        // Domain extends slightly beyond ticks for visual padding
        const xDomainMin = xTickResult.min - xPadding;
        const xDomainMax = xTickResult.max + xPadding;
        const yDomainMin = yTickResult.min - yPadding;
        const yDomainMax = yTickResult.max + yPadding;
        
        // Filter ticks to ensure they're within the domain bounds
        // Use the actual domain min/max values (not reversed) for filtering
        const xDomainFinal = reversedX ? [xDomainMax, xDomainMin] : [xDomainMin, xDomainMax];
        const yDomainFinal = reversedY ? [yDomainMax, yDomainMin] : [yDomainMin, yDomainMax];
        
        // Filter ticks using the non-reversed domain bounds
        // This ensures ticks are within the actual data range
        const filteredXTicks = xTickResult.ticks.filter(tick => 
            tick >= xDomainMin && tick <= xDomainMax
        );
        const filteredYTicks = yTickResult.ticks.filter(tick => 
            tick >= yDomainMin && tick <= yDomainMax
        );
        
        // Apply zoom domains if set
        // IMPORTANT: Recharts handles reversal internally when reversed={true} is set on the axis
        // So we should always pass domains in normal order [min, max], and let Recharts handle the reversal
        const finalXDomain = xZoomDomain 
            ? xZoomDomain  // Zoom domains are stored in normal order
            : [xDomainMin, xDomainMax];  // Always use normal order, Recharts will reverse if needed
        const finalYDomain = yZoomDomain 
            ? yZoomDomain  // Zoom domains are stored in normal order
            : [yDomainMin, yDomainMax];  // Always use normal order, Recharts will reverse if needed
        
        // When zoomed, filter ticks to only show those within the zoom domain
        // Also ensure domain includes all visible ticks plus padding
        const finalXTicks = xZoomDomain 
            ? filteredXTicks.filter(tick => {
                const domainMin = Math.min(...finalXDomain);
                const domainMax = Math.max(...finalXDomain);
                return tick >= domainMin && tick <= domainMax;
            })
            : filteredXTicks;
        const finalYTicks = yZoomDomain
            ? filteredYTicks.filter(tick => {
                const domainMin = Math.min(...finalYDomain);
                const domainMax = Math.max(...finalYDomain);
                return tick >= domainMin && tick <= domainMax;
            })
            : filteredYTicks;
        
        // Adjust domain to ensure all visible ticks are within bounds
        // Add small padding to prevent ticks from touching axis lines
        const xTickPadding = xZoomDomain && finalXTicks.length > 0 
            ? (Math.max(...finalXTicks) - Math.min(...finalXTicks)) * 0.02 || 1
            : 0;
        const yTickPadding = yZoomDomain && finalYTicks.length > 0
            ? (Math.max(...finalYTicks) - Math.min(...finalYTicks)) * 0.02 || 1
            : 0;
        
        // When zoomed, adjust domain with padding while preserving order
        // When not zoomed, use finalXDomain/finalYDomain which already have reversal applied
        let adjustedXDomain;
        let adjustedYDomain;
        
        if (xZoomDomain && finalXTicks.length > 0) {
            // Zoomed: add padding around visible ticks
            // Domains are always in normal order [min, max], Recharts handles reversal
            const domainMin = Math.min(...finalXDomain);
            const domainMax = Math.max(...finalXDomain);
            adjustedXDomain = [domainMin - xTickPadding, domainMax + xTickPadding];
        } else {
            // Not zoomed: use finalXDomain (always in normal order)
            adjustedXDomain = finalXDomain;
        }
        
        if (yZoomDomain && finalYTicks.length > 0) {
            // Zoomed: add padding around visible ticks
            // Domains are always in normal order [min, max], Recharts handles reversal
            const domainMin = Math.min(...finalYDomain);
            const domainMax = Math.max(...finalYDomain);
            adjustedYDomain = [domainMin - yTickPadding, domainMax + yTickPadding];
        } else {
            // Not zoomed: use finalYDomain (always in normal order)
            adjustedYDomain = finalYDomain;
        }
        
        // Ensure domains are valid arrays with finite numbers
        const safeXDomainMin = isFinite(xDomainMin) ? xDomainMin : 0;
        const safeXDomainMax = isFinite(xDomainMax) ? xDomainMax : 100;
        const safeYDomainMin = isFinite(yDomainMin) ? yDomainMin : 0;
        const safeYDomainMax = isFinite(yDomainMax) ? yDomainMax : 100;
        
        let safeXDomain;
        let safeYDomain;
        
        if (Array.isArray(adjustedXDomain) && adjustedXDomain.length === 2 && 
            isFinite(adjustedXDomain[0]) && isFinite(adjustedXDomain[1])) {
            // Use adjusted domain as-is (always in normal order, Recharts handles reversal)
            safeXDomain = adjustedXDomain;
        } else {
            // Fallback to base domain (always in normal order)
            safeXDomain = [safeXDomainMin, safeXDomainMax];
        }
        
        if (Array.isArray(adjustedYDomain) && adjustedYDomain.length === 2 && 
            isFinite(adjustedYDomain[0]) && isFinite(adjustedYDomain[1])) {
            // Use adjusted domain as-is (always in normal order, Recharts handles reversal)
            safeYDomain = adjustedYDomain;
        } else {
            // Fallback to base domain (always in normal order)
            safeYDomain = [safeYDomainMin, safeYDomainMax];
        }
        
        return {
            xDomain: safeXDomain,
            yDomain: safeYDomain,
            xTicks: finalXTicks.filter(t => isFinite(t)),
            yTicks: finalYTicks.filter(t => isFinite(t)),
            xDomainMin: safeXDomainMin,
            xDomainMax: safeXDomainMax,
            yDomainMin: safeYDomainMin,
            yDomainMax: safeYDomainMax,
        };
        } catch (error) {
            console.error('Error calculating domains:', error);
            return { 
                xDomain: reversedX ? [100, 0] : [0, 100], 
                yDomain: reversedY ? [100, 0] : [0, 100], 
                xTicks: [], 
                yTicks: [],
                xDomainMin: 0,
                xDomainMax: 100,
                yDomainMin: 0,
                yDomainMax: 100,
            };
        }
    }, [data, xDataKey, yDataKey, reversedX, reversedY, xZoomDomain, yZoomDomain]);

    // Custom tooltip with team logo
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) {
            return null;
        }

        const point = payload[0].payload;
        const teamInfo = teamMap[point.team];

        return (
            <Paper sx={{ p: 2, border: '1px solid #ccc', maxWidth: 250 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {teamInfo?.logo && (
                        <Avatar
                            src={teamInfo.logo}
                            alt={teamInfo.name}
                            sx={{ width: 32, height: 32 }}
                        />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {teamInfo?.name || point.team}
                    </Typography>
                </Box>
                <Typography variant="body2">
                    <strong>{xAxisLabel}:</strong> {
                        point[xDataKey] != null 
                            ? ((xDataKey.includes('success') || xDataKey.includes('ThirdFourth')) 
                                ? point[xDataKey].toFixed(2) 
                                : point[xDataKey].toFixed(1))
                            : 'N/A'
                    }
                </Typography>
                <Typography variant="body2">
                    <strong>{yAxisLabel}:</strong> {
                        point[yDataKey] != null 
                            ? ((yDataKey.includes('success') || yDataKey.includes('ThirdFourth')) 
                                ? point[yDataKey].toFixed(2) 
                                : point[yDataKey].toFixed(1))
                            : 'N/A'
                    }
                </Typography>
            </Paper>
        );
    };

    // Custom shape for team logos - just the logo, no circle
    const CustomShape = (props) => {
        const { cx, cy, payload } = props;
        const teamInfo = teamMap[payload.team];
        
        if (!teamInfo?.logo) {
            // Fallback to colored circle if no logo
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
        
        // Just the logo image, no circle background
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

    // Calculate base domains for zoom
    const baseDomains = useMemo(() => {
        if (!data || data.length === 0) {
            const defaultDomains = { xDomainMin: 0, xDomainMax: 100, yDomainMin: 0, yDomainMax: 100 };
            baseDomainsRef.current = defaultDomains;
            return defaultDomains;
        }
        const xValues = data.map(d => d[xDataKey]).filter(v => v != null && !isNaN(v));
        const yValues = data.map(d => d[yDataKey]).filter(v => v != null && !isNaN(v));
        if (xValues.length === 0 || yValues.length === 0) {
            const defaultDomains = { xDomainMin: 0, xDomainMax: 100, yDomainMin: 0, yDomainMax: 100 };
            baseDomainsRef.current = defaultDomains;
            return defaultDomains;
        }
        const domains = {
            xDomainMin: Math.min(...xValues),
            xDomainMax: Math.max(...xValues),
            yDomainMin: Math.min(...yValues),
            yDomainMax: Math.max(...yValues),
        };
        // Update ref immediately for use in drag handler
        baseDomainsRef.current = domains;
        return domains;
    }, [data, xDataKey, yDataKey]);

    // Zoom handlers for scatter plots - allow zooming beyond data bounds
    const handleZoomIn = () => {
        const currentXDomain = xZoomDomain || [baseDomains.xDomainMin, baseDomains.xDomainMax];
        const currentYDomain = yZoomDomain || [baseDomains.yDomainMin, baseDomains.yDomainMax];
        const xRange = currentXDomain[1] - currentXDomain[0];
        const yRange = currentYDomain[1] - currentYDomain[0];
        const xCenter = (currentXDomain[0] + currentXDomain[1]) / 2;
        const yCenter = (currentYDomain[0] + currentYDomain[1]) / 2;
        
        // Allow zooming beyond bounds - don't constrain to data range
        setXZoomDomain([xCenter - xRange * 0.35, xCenter + xRange * 0.35]);
        setYZoomDomain([yCenter - yRange * 0.35, yCenter + yRange * 0.35]);
    };

    const handleZoomOut = () => {
        const currentXDomain = xZoomDomain || [baseDomains.xDomainMin, baseDomains.xDomainMax];
        const currentYDomain = yZoomDomain || [baseDomains.yDomainMin, baseDomains.yDomainMax];
        const xRange = currentXDomain[1] - currentXDomain[0];
        const yRange = currentYDomain[1] - currentYDomain[0];
        const xCenter = (currentXDomain[0] + currentXDomain[1]) / 2;
        const yCenter = (currentYDomain[0] + currentYDomain[1]) / 2;
        
        const newXRange = xRange * 1.4;
        const newYRange = yRange * 1.4;
        const newXDomain = [xCenter - newXRange / 2, xCenter + newXRange / 2];
        const newYDomain = [yCenter - newYRange / 2, yCenter + newYRange / 2];
        
        // Check if we've zoomed out enough to see all data
        if (newXDomain[0] <= baseDomains.xDomainMin && newXDomain[1] >= baseDomains.xDomainMax && 
            newYDomain[0] <= baseDomains.yDomainMin && newYDomain[1] >= baseDomains.yDomainMax) {
            setXZoomDomain(null);
            setYZoomDomain(null);
        } else {
            setXZoomDomain(newXDomain);
            setYZoomDomain(newYDomain);
        }
    };

    const handleResetZoom = () => {
        setXZoomDomain(null);
        setYZoomDomain(null);
    };

    // Pan/drag handlers for scatter plots - enable when zoomed
    const handleMouseDown = (e) => {
        // Only enable panning if zoomed in
        if (!(xZoomDomain || yZoomDomain)) {
            return;
        }
        
        // Don't start dragging if clicking on buttons or icons
        const target = e.target;
        const isButton = target.closest('button') || target.closest('[role="button"]') || 
                         target.closest('.MuiIconButton-root') || target.closest('.MuiTooltip-root');
        if (isButton) {
            return;
        }
        
        // Allow dragging on the chart area (SVG elements)
        // Use capture phase to ensure we get the event before SVG handles it
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = useRef((e) => {
        // Use refs to get current values (always up-to-date)
        if (!isDraggingRef.current || !dragStartRef.current) {
            return;
        }
        
        const currentXZoom = xZoomDomainRef.current;
        const currentYZoom = yZoomDomainRef.current;
        const currentDragStart = dragStartRef.current;
        const currentBaseDomains = baseDomainsRef.current;
        
        if (!currentXZoom && !currentYZoom) {
            return;
        }
        
        e.preventDefault();
        const deltaX = e.clientX - currentDragStart.x;
        const deltaY = e.clientY - currentDragStart.y;
        
        // Only pan if mouse moved significantly (avoid accidental pans)
        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;
        
        // Calculate pan amount based on current zoom domain
        // Domains are stored in normal order [min, max]
        const currentXDomain = currentXZoom || [currentBaseDomains.xDomainMin, currentBaseDomains.xDomainMax];
        const currentYDomain = currentYZoom || [currentBaseDomains.yDomainMin, currentBaseDomains.yDomainMax];
        
        const xRange = currentXDomain[1] - currentXDomain[0];
        const yRange = currentYDomain[1] - currentYDomain[0];
        
        // Pan amount proportional to domain range
        // For X: dragging left (negative deltaX) should pan viewport right (increase domain to show higher X values)
        //        dragging right (positive deltaX) should pan viewport left (decrease domain to show lower X values)
        // For Y: dragging up (negative deltaY) should pan viewport down (decrease domain to show lower Y values)
        //        dragging down (positive deltaY) should pan viewport up (increase domain to show higher Y values)
        // Dragging left (negative deltaX) → move right (increase domain) → panX should be positive
        // Dragging right (positive deltaX) → move left (decrease domain) → panX should be negative
        const panX = -(deltaX / 500) * xRange; // Negative deltaX (left) → positive panX → increase domain → move right
        
        // Dragging up (negative deltaY) → move down (decrease domain) → panY should be negative
        // Dragging down (positive deltaY) → move up (increase domain) → panY should be positive
        const panY = (deltaY / 500) * yRange; // Negative deltaY (up) → negative panY → decrease domain → move down
        
        // Update domains (always keep in normal order [min, max])
        const newXDomain = [currentXDomain[0] + panX, currentXDomain[1] + panX];
        const newYDomain = [currentYDomain[0] + panY, currentYDomain[1] + panY];
        
        // Update refs immediately - the RAF loop will pick these up and update state
        xZoomDomainRef.current = newXDomain;
        yZoomDomainRef.current = newYDomain;
        
        setDragStart({ x: e.clientX, y: e.clientY });
    });

    const handleMouseUp = useMemo(() => {
        return () => {
            setIsDragging(false);
            setDragStart(null);
        };
    }, []);

    // Add event listeners for panning
    useEffect(() => {
        if (isDragging) {
            const moveHandler = (e) => handleMouseMove.current(e);
            const upHandler = () => handleMouseUp();
            
            window.addEventListener('mousemove', moveHandler, { passive: false });
            window.addEventListener('mouseup', upHandler);
            window.addEventListener('mouseleave', upHandler);
            
            return () => {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);
                window.removeEventListener('mouseleave', upHandler);
            };
        }
    }, [isDragging, handleMouseUp]);

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No data available for {title}
                </Typography>
            </Paper>
        );
    }

    // Debug logging
    console.log('ScatterPlotChart render:', { 
        dataLength: data?.length, 
        xDomain, 
        yDomain, 
        xTicks: xTicks?.length, 
        yTicks: yTicks?.length 
    });

    return (
        <Box sx={{ width: '100%', height: 600, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    {title}
                </Typography>
                {/* Zoom controls */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <MuiTooltip title="Zoom In">
                        <IconButton size="small" onClick={handleZoomIn}>
                            <ZoomIn />
                        </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Zoom Out">
                        <IconButton size="small" onClick={handleZoomOut} disabled={xZoomDomain === null && yZoomDomain === null}>
                            <ZoomOut />
                        </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Reset Zoom">
                        <IconButton size="small" onClick={handleResetZoom} disabled={xZoomDomain === null && yZoomDomain === null}>
                            <FitScreen />
                        </IconButton>
                    </MuiTooltip>
                </Box>
            </Box>
            <Box 
                onMouseDown={handleMouseDown}
                onMouseDownCapture={handleMouseDown}
                onContextMenu={(e) => e.preventDefault()}
                sx={{ 
                    cursor: (xZoomDomain || yZoomDomain) ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none',
                    position: 'relative',
                    '& svg': {
                        touchAction: 'none'
                    }
                }}
            >
                <ResponsiveContainer width="100%" height={500}>
                    <ScatterChart
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 60,
                            left: 70,
                        }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        dataKey={xDataKey}
                        name={xAxisLabel}
                        label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }}
                        domain={xDomain}
                        ticks={xTicks}
                        reversed={reversedX}
                        allowDecimals={xDataKey.includes('success') || xDataKey.includes('ThirdFourth')}
                        allowDataOverflow={true}
                        tickFormatter={(value) => {
                            // Format based on whether it's a success rate (decimal) or regular number
                            const isSuccessRate = xDataKey.includes('success') || yDataKey.includes('success') || 
                                                 xDataKey.includes('ThirdFourth') || yDataKey.includes('ThirdFourth');
                            return isSuccessRate ? value.toFixed(2) : value.toFixed(0);
                        }}
                    />
                    <YAxis
                        type="number"
                        dataKey={yDataKey}
                        name={yAxisLabel}
                        label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 15 }}
                        domain={yDomain}
                        ticks={yTicks}
                        reversed={reversedY}
                        allowDecimals={yDataKey.includes('success') || yDataKey.includes('ThirdFourth')}
                        allowDataOverflow={true}
                        width={60}
                        tickFormatter={(value) => {
                            // Format based on whether it's a success rate (decimal) or regular number
                            const isSuccessRate = xDataKey.includes('success') || yDataKey.includes('success') || 
                                                 xDataKey.includes('ThirdFourth') || yDataKey.includes('ThirdFourth');
                            return isSuccessRate ? value.toFixed(2) : value.toFixed(0);
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    
                    {/* Median reference lines */}
                    <ReferenceLine
                        x={xMedian}
                        stroke="red"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: 'Median', position: 'top' }}
                    />
                    <ReferenceLine
                        y={yMedian}
                        stroke="red"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: 'Median', position: 'right' }}
                    />
                    
                    <Scatter
                        name="Teams"
                        data={data}
                        shape={<CustomShape />}
                    >
                        {data.map((entry, index) => (
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
