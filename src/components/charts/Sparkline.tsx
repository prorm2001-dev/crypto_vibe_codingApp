"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";

type Props = {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  filled?: boolean;
  animate?: boolean;
  className?: string;
};

export function Sparkline({
  data,
  color,
  width = 88,
  height = 36,
  strokeWidth = 1.75,
  filled = true,
  animate = true,
  className = "",
}: Props) {
  const gradId = useId();

  const { linePath, areaPath, positive, lastPoint } = useMemo(() => {
    if (data.length < 2) {
      return { linePath: "", areaPath: "", positive: true, lastPoint: null };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || max * 0.001 || 1;
    const pad = 2;

    const points = data.map((value, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (value - min) / range) * (height - pad * 2);
      return { x, y };
    });

    const line = points.map((p) => `${p.x},${p.y}`).join(" ");
    const area = `M ${points[0].x} ${height} L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${height} Z`;

    return {
      linePath: line,
      areaPath: area,
      positive: data[data.length - 1] >= data[0],
      lastPoint: points[points.length - 1],
    };
  }, [data, width, height]);

  if (!linePath) {
    return (
      <svg
        width={width}
        height={height}
        className={`opacity-30 ${className}`}
        aria-hidden
      >
        <line
          x1={4}
          y1={height / 2}
          x2={width - 4}
          y2={height / 2}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {filled && (
        <motion.path
          d={areaPath}
          fill={`url(#${gradId})`}
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePath}
        initial={animate ? { pathLength: 0, opacity: 0.5 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.5}
          fill={positive ? color : "#f87171"}
        />
      )}
    </svg>
  );
}

export function formatPrice(price: number) {
  if (price >= 1000) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  return price.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export function formatChange(change: number) {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}
