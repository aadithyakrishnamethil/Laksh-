'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, RefreshCw, Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CBSE_SUBJECTS } from '@/lib/utils/constants'
import { toggleTask, rescheduleMissedTasks } from '@/lib/actions/task'
import type { SEED_PLAN_TASKS } from '@/lib/db/seed-data'

type Task = typeof SEED_PLAN_TASKS[number]
type ViewMode = 'list' | 'week'

interface PlannerClientProps {
  initialTasks: Task[]
  planId: string | null
}

const TYPE_COLORS: Record<string, string> = {
  learn: '#2A7AFE',
  practice: '#FF9F0A',
  revise: '#34C759',
}

const TYPE_LABELS: Record<string, string> = {
  learn: 'Learn',
  practice: 'Practice',
  revise: 'Revise',
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string, status: string) => void }) {
  const sub = CBSE_SUBJECTS.find((s) => s.id === task.subject_id)
  const done = task.status === 'done'
  const missed = task.status === 'missed'

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] border transition-all cursor-pointer group
        ${done ? 'border-[var(--accent-green)] bg-green-50/50 dark:bg-green-950/10' :
          missed ? 'border-[var(--accent-orange)] bg-orange-50/50 dark:bg-orange-950/10' :
          'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:shadow-sm'}`}
      onClick={() => onToggle(task.id, task.status)}
    >
      <button className="shrink-0" type="button" aria-label={done ? 'Mark incomplete' : 'Mark complete'}>
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)]" />
        ) : (
          <Circle className={`w-5 h-5 ${missed ? 'text-[var(--accent-orange)]' : 'text-[var(--border-subtle)] group-hover:text-[var(--accent-blue)]'} transition-colors`} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px]">{sub?.icon}</span>
          <span className={`text-[14px] font-medium ${done ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
            {sub?.name} — {TYPE_LABELS[task.type]}
          </span>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: TYPE_COLORS[task.type] + '20', color: TYPE_COLORS[task.type] }}
          >
            {TYPE_LABELS[task.type]}
          </span>
          {missed && <Badge variant="orange">Missed</Badge>}
        </div>
        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{task.est_minutes} min</p>
      </div>
    </motion.div>
  )
}

export function PlannerClient({ initialTasks, planId }: PlannerClientProps) {
  const [view, setView] = useState<ViewMode>('list')
  const [tasks, setTasks] = useState(initialTasks)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [isPending, startTransition] = useTransition()

  const today = new Date()
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function handleToggle(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done'
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus as Task['status'] } : t))
    )
    startTransition(async () => {
      try {
        await toggleTask(id, currentStatus)
      } catch {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: currentStatus as Task['status'] } : t))
        )
      }
    })
  }

  function handleReschedule() {
    const tomorrow = format(addDays(today, 1), 'yyyy-MM-dd')
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.status === 'missed' ? { ...t, status: 'pending' as const, date: tomorrow } : t))
    )
    if (planId) {
      startTransition(async () => {
        try {
          await rescheduleMissedTasks(planId)
        } catch {
          // Best-effort — UI already updated
        }
      })
    }
  }

  const missedCount = tasks.filter((t) => t.status === 'missed').length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const totalCount = tasks.length

  const selectedTasks = tasks.filter((t) => isSameDay(parseISO(t.date), selectedDay))

  const listByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    acc[t.date] = [...(acc[t.date] ?? []), t]
    return acc
  }, {})

  const sortedDates = Object.keys(listByDate).sort()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Study Planner</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            {doneCount}/{totalCount} tasks done
            {missedCount > 0 && ` · ${missedCount} missed`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {missedCount > 0 && (
            <Button variant="secondary" onClick={handleReschedule} loading={isPending}>
              <RefreshCw className="w-4 h-4" />
              Reschedule Missed
            </Button>
          )}
          <div className="flex items-center bg-[var(--bg-subtle)] rounded-[var(--radius-pill)] p-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${view === 'list' ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setView('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${view === 'week' ? 'bg-white dark:bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Week
            </button>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.04 }}
      >
        <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#2A7AFE] to-[#34C759]"
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'week' ? (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Week nav */}
            <div className="flex items-center justify-between">
              <button onClick={() => setWeekOffset((o) => o - 1)} className="p-2 rounded-full hover:bg-[var(--bg-subtle)] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[14px] font-medium text-[var(--text-primary)]">
                {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <button onClick={() => setWeekOffset((o) => o + 1)} className="p-2 rounded-full hover:bg-[var(--bg-subtle)] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day strip */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d) => {
                const dayTasks = tasks.filter((t) => isSameDay(parseISO(t.date), d))
                const isToday = isSameDay(d, today)
                const isSelected = isSameDay(d, selectedDay)
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setSelectedDay(d)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-[var(--radius-lg)] transition-all ${
                      isSelected ? 'bg-gradient-to-br from-[#2A7AFE] to-[#53C8FF] text-white shadow' :
                      isToday ? 'bg-[var(--bg-subtle)] border border-[var(--accent-blue)]' :
                      'hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                      {format(d, 'EEE')}
                    </span>
                    <span className={`text-[16px] font-bold ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                      {format(d, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {dayTasks.slice(0, 3).map((t, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: isSelected ? 'rgba(255,255,255,0.7)' : (TYPE_COLORS[t.type] ?? '#2A7AFE') }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected day tasks */}
            <Card>
              <CardHeader>
                <CardTitle>{format(selectedDay, 'EEEE, MMMM d')}</CardTitle>
                <p className="text-[13px] text-[var(--text-secondary)]">{selectedTasks.length} tasks</p>
              </CardHeader>
              <CardContent>
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-[14px]">No tasks for this day</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTasks.map((t) => (
                      <TaskCard key={t.id} task={t} onToggle={handleToggle} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {sortedDates.map((date) => {
              const d = parseISO(date)
              const isToday = isSameDay(d, today)
              const dayTasks = listByDate[date]
              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                      {isToday ? 'Today' : format(d, 'EEEE, MMM d')}
                    </h3>
                    {isToday && <Badge variant="blue">Today</Badge>}
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {dayTasks.filter((t) => t.status === 'done').length}/{dayTasks.length} done
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayTasks.map((t) => (
                      <TaskCard key={t.id} task={t} onToggle={handleToggle} />
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
