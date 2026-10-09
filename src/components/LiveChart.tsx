/**
 * LiveChart component for SensorSure
 * Hand-written inline SVG chart with smooth curves, gradient fill, gridlines, hover tooltip,
 * and warning markers.
 */

import React, { useState } from 'react';
import { Reading, WarningItem } from '../detector/rules';
import { SensorProfile } from '../data/sensors';

interface LiveChartProps {
  readings: Reading[];
  profile: SensorProfile;
  warnings: WarningItem[];
}

export const LiveChart: React.FC<LiveChartProps> = ({ readings, profile, warnings }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (readings.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Waiting for sensor stream data...
      </div>
    );
  }

  const width = 700;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min and max values for scaling
  const values = readings.map(r => r.value);
  const minVal = Math.min(...values, profile.datasheetRange.min);
  const maxVal = Math.max(...values, profile.datasheetRange.max);
  const valSpan = maxVal - minVal || 1;

  const getX = (index: number) => {
    if (readings.length <= 1) return padding.left;
    return padding.left + (index / (readings.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - ((val - minVal) / valSpan) * chartHeight;
  };

  // Generate smooth path (Catmull-Rom or cubic bezier approximation)
  const points = readings.map((r, i) => ({ x: getX(i), y: getY(r.value), reading: r }));

  let pathString = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * 0.15;
    const cp1y = p1.y + (p2.y - p0.y) * 0.15;
    const cp2x = p2.x - (p3.x - p1.x) * 0.15;
    const cp2y = p2.y - (p3.y - p1.y) * 0.15;

    pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // Area path for gradient fill
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const areaString = `${pathString} L ${lastX} ${padding.top + chartHeight} L ${firstX} ${padding.top + chartHeight} Z`;

  // Soft gridlines (4 horizontal steps)
  const gridSteps = 4;
  const gridLines = Array.from({ length: gridSteps + 1 }).map((_, i) => {
    const val = minVal + (valSpan / gridSteps) * i;
    const y = getY(val);
    return { val: Number(val.toFixed(1)), y };
  });

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14F1D9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14F1D9" stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Soft Grid Lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={width - padding.right}
              y2={line.y}
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="1"
              opacity="0.4"
            />
            <text
              x={padding.left - 8}
              y={line.y + 4}
              fill="#94A3B8"
              fontSize="10"
              textAnchor="end"
              fontFamily="JetBrains Mono, monospace"
            >
              {line.val}
            </text>
          </g>
        ))}

        {/* Area Fill */}
        <path d={areaString} fill="url(#chartGradient)" />

        {/* Smooth Line Curve */}
        <path
          d={pathString}
          fill="none"
          stroke="#14F1D9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Data points & Warning markers */}
        {points.map((p, i) => {
          const hasWarning = warnings.some(
            w => !w.isCleared && Math.abs(w.timestamp - p.reading.timestamp) < 2000
          );
          const isHovered = hoverIndex === i;

          return (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
              {/* Warning marker */}
              {hasWarning && (
                <circle cx={p.x} cy={p.y} r="6" fill="#EF4444" opacity="0.9" className="animate-ping" />
              )}
              {hasWarning && (
                <circle cx={p.x} cy={p.y} r="5" fill="#EF4444" stroke="#0B1020" strokeWidth="1.5" />
              )}

              {/* Normal point dot on hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : hasWarning ? 5 : 3}
                fill={hasWarning ? '#EF4444' : isHovered ? '#FFFFFF' : '#14F1D9'}
                stroke="#0B1020"
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip Overlay */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="absolute bg-slate-900/95 backdrop-blur-md border border-slate-700 text-xs px-3 py-2 rounded-xl shadow-xl pointer-events-none z-30 font-mono"
          style={{
            left: `${(hoverIndex / Math.max(1, points.length - 1)) * 80 + 10}%`,
            top: '20px',
          }}
        >
          <div className="text-teal-400 font-bold">
            {points[hoverIndex].reading.value} {profile.units}
          </div>
          <div className="text-slate-400 text-[10px]">
            {new Date(points[hoverIndex].reading.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};
