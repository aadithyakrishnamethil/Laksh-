'use client'

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from 'recharts'

interface SubjectData {
  subject: string
  mastery: number
  target: number
}

interface SubjectRadarProps {
  data: SubjectData[]
  height?: number
}

export function SubjectRadar({ data, height = 240 }: SubjectRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
        <PolarGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickLine={false}
        />
        <Radar
          name="Target"
          dataKey="target"
          stroke="#E5E5EA"
          fill="#E5E5EA"
          fillOpacity={0.2}
          strokeWidth={1.5}
        />
        <Radar
          name="Mastery"
          dataKey="mastery"
          stroke="#2A7AFE"
          fill="#2A7AFE"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 3, fill: '#2A7AFE', strokeWidth: 0 }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-dropdown)',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
