'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

interface DataPoint {
  [key: string]: string | number
}

interface ScoreLineChartProps {
  data: DataPoint[]
  xKey: string
  yKey: string
  color?: string
  gradientFrom?: string
  gradientTo?: string
  height?: number
  showAxes?: boolean
}

export function ScoreLineChart({
  data,
  xKey,
  yKey,
  color = '#2A7AFE',
  gradientFrom = '#2A7AFE',
  gradientTo = '#53C8FF',
  height = 120,
  showAxes = false,
}: ScoreLineChartProps) {
  const gradientId = `grad-${yKey}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} stopOpacity={0.12} />
            <stop offset="100%" stopColor={gradientTo} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {showAxes && (
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
          />
        )}
        {showAxes && (
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
        )}
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-dropdown)',
          }}
          itemStyle={{ color: color }}
          labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
          cursor={{ stroke: 'var(--border-subtle)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: 'var(--bg-surface)' }}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
