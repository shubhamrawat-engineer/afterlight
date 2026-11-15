import { useState, useMemo, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';
import type { SpectralProfile, SpectralDataPoint } from '../types/spectral.types';

interface SpectralChartProps {
  profiles: SpectralProfile[];
  onSelectPoint?: (profile: SpectralProfile, point: SpectralDataPoint) => void;
  selectedPoint?: { profile: SpectralProfile; point: SpectralDataPoint } | null;
  className?: string;
}

interface HoverState {
  profile: SpectralProfile;
  point: SpectralDataPoint;
  clientX: number;
  clientY: number;
  svgX: number;
  svgY: number;
}

export function SpectralChart({
  profiles,
  onSelectPoint,
  selectedPoint,
  className,
}: SpectralChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showErrorBars, setShowErrorBars] = useState<boolean>(true);
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  // SVG Coordinate Box
  const viewBoxWidth = 900;
  const viewBoxHeight = 440;
  const padding = { top: 30, right: 30, bottom: 55, left: 75 };
  const plotWidth = viewBoxWidth - padding.left - padding.right;
  const plotHeight = viewBoxHeight - padding.top - padding.bottom;

  // Determine global X and Y domains across active profiles
  const { minX, maxX, minY, maxY, primaryUnit } = useMemo(() => {
    let minWl = Infinity;
    let maxWl = -Infinity;
    let minSig = Infinity;
    let maxSig = -Infinity;
    let unit = 'Signal (arb)';

    if (profiles.length === 0) {
      return { minX: 0.8, maxX: 5.0, minY: 0, maxY: 100, primaryUnit: 'Flux' };
    }

    profiles.forEach((p) => {
      unit = p.flux_unit;
      p.data_points.forEach((pt) => {
        if (pt.wavelength_um < minWl) minWl = pt.wavelength_um;
        if (pt.wavelength_um > maxWl) maxWl = pt.wavelength_um;

        const valWithUnc = pt.signal_value + (pt.uncertainty ?? 0);
        const valMinusUnc = pt.signal_value - (pt.uncertainty ?? 0);

        if (valWithUnc > maxSig) maxSig = valWithUnc;
        if (valMinusUnc < minSig) minSig = valMinusUnc;
      });
    });

    if (minWl === Infinity) minWl = 0.8;
    if (maxWl === -Infinity) maxWl = 5.0;
    if (minSig === Infinity) minSig = 0;
    if (maxSig === -Infinity) maxSig = 100;

    // Apply 12% headroom on Y and slight buffer on X
    const yHeadroom = (maxSig - minSig) * 0.12 || 5;
    const computedMinY = Math.max(0, Math.floor(minSig - yHeadroom));
    const computedMaxY = Math.ceil(maxSig + yHeadroom);

    // Apply zoom
    const rangeX = (maxWl - minWl) / zoomLevel;
    const centerX = (minWl + maxWl) / 2;
    const computedMinX = Math.max(0.5, centerX - rangeX / 2);
    const computedMaxX = centerX + rangeX / 2;

    return {
      minX: computedMinX,
      maxX: computedMaxX,
      minY: computedMinY,
      maxY: computedMaxY,
      primaryUnit: unit,
    };
  }, [profiles, zoomLevel]);

  // Coordinate scales
  const scaleX = useCallback(
    (wl: number) => {
      return padding.left + ((wl - minX) / (maxX - minX)) * plotWidth;
    },
    [minX, maxX, plotWidth, padding.left]
  );

  const scaleY = useCallback(
    (sig: number) => {
      return padding.top + plotHeight - ((sig - minY) / (maxY - minY)) * plotHeight;
    },
    [minY, maxY, plotHeight, padding.top]
  );

  // Generate ticks for X-axis (wavelength)
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const count = 6;
    const step = (maxX - minX) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(Math.round((minX + i * step) * 100) / 100);
    }
    return ticks;
  }, [minX, maxX]);

  // Generate ticks for Y-axis (flux/signal)
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const count = 5;
    const step = (maxY - minY) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(Math.round((minY + i * step) * 10) / 10);
    }
    return ticks;
  }, [minY, maxY]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z * 1.3, 4.0));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z / 1.3, 1.0));
  const handleResetZoom = () => setZoomLevel(1.0);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-xl border border-[#24344D] bg-[#101A2B] p-5 shadow-[0_6px_24px_rgba(3,6,14,0.45)] select-none ${className ?? ''}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2940] pb-3 mb-2">
        <div className="flex items-center gap-2.5">
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F4F7FF] tracking-tight">
            Spectrophotometric Flux Profile (S_ν vs. λ)
          </span>
          <span className="rounded-md bg-[#131F33] px-2 py-0.5 text-[10px] font-mono text-[#45D5F2] border border-[#24344D]">
            {primaryUnit}
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowErrorBars((b) => !b)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors border cursor-pointer ${
              showErrorBars
                ? 'border-[#4388FF]/50 bg-[#4388FF]/16 text-[#F4F7FF]'
                : 'border-[#24344D] bg-[#131F33] text-[#B5C2D6] hover:text-[#F4F7FF]'
            }`}
          >
            {showErrorBars ? 'Hide Error Bars (±σ)' : 'Show Error Bars (±σ)'}
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom (1x)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Graph */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverState(null)}
        >
          {/* Background Grid */}
          <g className="grid-lines" stroke="#1e293b" strokeDasharray="3 3">
            {/* Horizontal Y Grid */}
            {yTicks.map((yVal) => (
              <line
                key={`y-grid-${yVal}`}
                x1={padding.left}
                y1={scaleY(yVal)}
                x2={padding.left + plotWidth}
                y2={scaleY(yVal)}
              />
            ))}
            {/* Vertical X Grid */}
            {xTicks.map((xVal) => (
              <line
                key={`x-grid-${xVal}`}
                x1={scaleX(xVal)}
                y1={padding.top}
                x2={scaleX(xVal)}
                y2={padding.top + plotHeight}
              />
            ))}
          </g>

          {/* Axes Lines */}
          <g className="axes" stroke="#475569" strokeWidth="1.5">
            {/* X-Axis */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
            />
            {/* Y-Axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
            />
          </g>

          {/* Y-Axis Tick Labels & Unit */}
          <g className="y-labels">
            {yTicks.map((yVal) => (
              <text
                key={`y-text-${yVal}`}
                x={padding.left - 10}
                y={scaleY(yVal) + 4}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {yVal}
              </text>
            ))}
            <text
              x={-(padding.top + plotHeight / 2)}
              y={20}
              transform="rotate(-90)"
              textAnchor="middle"
              className="fill-slate-300 font-bold text-[11px] tracking-wider"
            >
              Signal Intensity ({primaryUnit})
            </text>
          </g>

          {/* X-Axis Tick Labels & Unit */}
          <g className="x-labels">
            {xTicks.map((xVal) => (
              <text
                key={`x-text-${xVal}`}
                x={scaleX(xVal)}
                y={padding.top + plotHeight + 20}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {xVal}
              </text>
            ))}
            <text
              x={padding.left + plotWidth / 2}
              y={padding.top + plotHeight + 42}
              textAnchor="middle"
              className="fill-slate-300 font-bold text-[11px] tracking-wider"
            >
              Wavelength λ (μm)
            </text>
          </g>

          {/* Spectral Series Curves & Points */}
          {profiles.map((profile) => {
            const sortedPoints = [...profile.data_points].sort(
              (a, b) => a.wavelength_um - b.wavelength_um
            );

            // Compute SVG path string
            const pathData = sortedPoints
              .map((pt, idx) => {
                const x = scaleX(pt.wavelength_um);
                const y = scaleY(pt.signal_value);
                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ');

            return (
              <g key={`series-${profile.epoch_id}`}>
                {/* Uncertainty Error Bars */}
                {showErrorBars &&
                  sortedPoints.map((pt) => {
                    if (pt.uncertainty === null || pt.uncertainty <= 0) return null;
                    const x = scaleX(pt.wavelength_um);
                    const yTop = scaleY(pt.signal_value + pt.uncertainty);
                    const yBottom = scaleY(pt.signal_value - pt.uncertainty);
                    return (
                      <g key={`err-${pt.index}`} stroke={profile.color} strokeWidth="1" opacity="0.6">
                        <line x1={x} y1={yTop} x2={x} y2={yBottom} />
                        <line x1={x - 3} y1={yTop} x2={x + 3} y2={yTop} />
                        <line x1={x - 3} y1={yBottom} x2={x + 3} y2={yBottom} />
                      </g>
                    );
                  })}

                {/* Profile Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={profile.color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-all duration-150"
                  style={{ filter: `drop-shadow(0 0 6px ${profile.color}40)` }}
                />

                {/* Data Points */}
                {sortedPoints.map((pt) => {
                  const x = scaleX(pt.wavelength_um);
                  const y = scaleY(pt.signal_value);
                  const isFlagged = pt.quality_flag !== 'OK';
                  const isSelected =
                    selectedPoint?.point.index === pt.index &&
                    selectedPoint?.profile.epoch_id === profile.epoch_id;

                  return (
                    <circle
                      key={`pt-${pt.index}`}
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : isFlagged ? 4.5 : 3.5}
                      fill={isFlagged ? '#f59e0b' : profile.color}
                      stroke={isSelected ? '#ffffff' : '#0b0f19'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="cursor-pointer transition-transform duration-100 hover:scale-150"
                      onClick={() => onSelectPoint?.(profile, pt)}
                      onMouseEnter={(e) => {
                        setHoverState({
                          profile,
                          point: pt,
                          clientX: e.clientX,
                          clientY: e.clientY,
                          svgX: x,
                          svgY: y,
                        });
                      }}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Interactive Crosshairs when hovering */}
          {hoverState && (
            <g className="crosshairs" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1">
              <line
                x1={hoverState.svgX}
                y1={padding.top}
                x2={hoverState.svgX}
                y2={padding.top + plotHeight}
              />
              <line
                x1={padding.left}
                y1={hoverState.svgY}
                x2={padding.left + plotWidth}
                y2={hoverState.svgY}
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverState && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur-md transition-all duration-75"
            style={{
              left: `${Math.min(Math.max((hoverState.svgX / viewBoxWidth) * 100, 15), 75)}%`,
              top: `${Math.max(10, (hoverState.svgY / viewBoxHeight) * 100 - 30)}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1.5">
              <span className="font-bold text-white">{hoverState.profile.epoch_label}</span>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: hoverState.profile.color }}
              />
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between gap-4 text-slate-300">
                <span>Wavelength (λ):</span>
                <span className="font-bold text-sky-400">{hoverState.point.wavelength_um} μm</span>
              </div>
              <div className="flex justify-between gap-4 text-slate-300">
                <span>Signal (S_ν):</span>
                <span className="font-bold text-emerald-400">
                  {hoverState.point.signal_value} {hoverState.profile.flux_unit}
                </span>
              </div>
              <div className="flex justify-between gap-4 text-slate-400">
                <span>Uncertainty (±σ):</span>
                <span>
                  {hoverState.point.uncertainty !== null
                    ? `±${hoverState.point.uncertainty} ${hoverState.profile.flux_unit}`
                    : 'Uncertainty not available'}
                </span>
              </div>
              {hoverState.point.quality_flag !== 'OK' && (
                <div className="mt-1 flex items-center gap-1 rounded bg-amber-950/80 px-1.5 py-0.5 text-[10px] text-amber-300 border border-amber-500/40">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>Flag: {hoverState.point.quality_flag}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
