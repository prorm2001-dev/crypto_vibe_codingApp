"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";

type Point = { t: number; price: number };

type Props = {
  history: Point[];
  startPrice?: number;
  color?: string;
  height?: number;
  className?: string;
};

export function LivePriceChart({
  history,
  startPrice,
  color = "#34d399",
  height = 140,
  className = "",
}: Props) {
  const gradId = useId();
  const width = 100;

  const { linePath, areaPath, minY, maxY, latest } = useMemo(() => {
    if (history.length < 2) {
      return { linePath: "", areaPath: "", minY: 0, maxY: 0, latest: history[0]?.price };
    }

    const prices = history.map((p) => p.price);
    if (startPrice !== undefined) prices.push(startPrice);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.08 || max * 0.001 || 0.01;
    const minY = min - pad;
    const maxY = max + pad;
    const range = maxY - minY || 1;

    const padX = 4;
    const padY = 8;
    const chartH = height - padY * 2;

    const points = history.map((p, i) => {
      const x = padX + (i / (history.length - 1)) * (width - padX * 2);
      const y = padY + (1 - (p.price - minY) / range) * chartH;
      return { x, y, price: p.price };
    });

    const line = points.map((p) => `${p.x},${p.y}`).join(" ");
    const area = `M ${points[0].x} ${height} L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${height} Z`;

    return {
      linePath: line,
      areaPath: area,
      minY,
      maxY,
      latest: points[points.length - 1],
    };
  }, [history, startPrice, height]);

  const startLineY = useMemo(() => {
    if (startPrice === undefined || history.length < 2) return null;
    const padY = 8;
    const chartH = height - padY * 2;
    const range = maxY - minY || 1;
    return padY + (1 - (startPrice - minY) / range) * chartH;
  }, [startPrice, history.length, minY, maxY, height]);

  if (history.length < 2) {
    return (
      <div
        className={`rounded-xl bg-black/30 border border-white/5 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-xs text-zinc-500 animate-pulse">Chart warming up...</p>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl bg-black/30 border border-white/5 overflow-hidden ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        aria-label="Live price chart"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1={0}
            x2={width}
            y1={height * pct}
            y2={height * pct}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={0.5}
          />
        ))}

        {startLineY !== null && (
          <line
            x1={0}
            x2={width}
            y1={startLineY}
            y2={startLineY}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={0.6}
            strokeDasharray="2 2"
          />
        )}

        <path d={areaPath} fill={`url(#${gradId})`} />
        <motion.polyline
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePath}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }}
        />

        {latest && (
          <circle cx={latest.x} cy={latest.y} r={1.8} fill={color}>
            <animate
              attributeName="r"
              values="1.8;3;1.8"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>

      <div className="absolute top-2 left-3 text-[10px] text-zinc-500">
        Live race chart
      </div>
      {startPrice !== undefined && (
        <div className="absolute top-2 right-3 text-[10px] text-zinc-500">
          Start ${startPrice}
        </div>
      )}
    </div>
  );
}
