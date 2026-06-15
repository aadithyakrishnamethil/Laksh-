import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import { ACHIEVEMENT_DEFS } from '@/lib/utils/constants'
import {
  SEED_STUDENT,
  SEED_GOAL,
  SEED_STREAK,
  SEED_XP,
  SEED_LEVEL,
  SEED_PREDICTIONS,
  SEED_SUBJECT_STATS,
  SEED_WEEKLY_CHART,
  SEED_PLAN_TASKS,
  SEED_BURNOUT,
  SEED_RECENT_ACTIVITY,
} from '@/lib/db/seed-data'
import type { SubjectBreakdown } from '@/stores/goal-store'

export interface DashboardData {
  student: { full_name: string }
  goal: { target_overall_pct: number }
  streak: { current: number; longest: number }
  xp: number
  level: number
  predictions: Array<{
    predicted_overall_pct: number
    confidence_pct: number
    risk_level: string
  }>
  subjectStats: Array<{
    subject: string
    mastery: number
    target: number
    color: string
  }>
  weeklyChart: Array<{ day: string; goalHrs: number; focusScore: number }>
  planTasks: Array<{
    id: string
    plan_id: string
    date: string
    subject_id: string
    chapter_id: string
    type: string
    est_minutes: number
    status: string
    rescheduled_from: string | null
  }>
  burnout: { level: string; interventions: string[] }
  recentActivity: Array<{ text: string; time: string; type: string }>
  isRealData: boolean
}

const SUBJECT_META: Record<string, { name: string; color: string }> = {
  phy: { name: 'Physics', color: '#2A7AFE' },
  chem: { name: 'Chemistry', color: '#34C759' },
  math: { name: 'Mathematics', color: '#FF9F0A' },
  bio: { name: 'Biology', color: '#FF3B30' },
  eng: { name: 'English', color: '#675178' },
  cs: { name: 'Computer Science', color: '#423376' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function getDashboardData(): Promise<DashboardData> {
  const seed: DashboardData = {
    student: { full_name: SEED_STUDENT.full_name },
    goal: { target_overall_pct: SEED_GOAL.target_overall_pct },
    streak: { current: SEED_STREAK.current, longest: SEED_STREAK.longest },
    xp: SEED_XP,
    level: SEED_LEVEL,
    predictions: SEED_PREDICTIONS,
    subjectStats: SEED_SUBJECT_STATS,
    weeklyChart: SEED_WEEKLY_CHART,
    planTasks: SEED_PLAN_TASKS,
    burnout: { level: SEED_BURNOUT.level, interventions: SEED_BURNOUT.interventions },
    recentActivity: SEED_RECENT_ACTIVITY,
    isRealData: false,
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return seed

    // First batch: queries that don't depend on each other
    const [
      profileRes,
      goalRes,
      streakRes,
      xpRes,
      predictionsRes,
      masteryRes,
      tasksRes,
      burnoutRes,
      productivityRes,
      focusRes,
    ] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase
        .from('goals')
        .select('id, target_overall_pct')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase.from('streaks').select('current, longest').eq('student_id', user.id).single(),
      supabase.from('xp_events').select('amount').eq('student_id', user.id),
      supabase
        .from('predictions')
        .select('predicted_overall_pct, confidence_pct, risk_level, generated_at')
        .eq('student_id', user.id)
        .order('generated_at', { ascending: true })
        .limit(10),
      supabase
        .from('mastery')
        .select('chapter_id, mastery_pct, label, chapters(subject_id, name)')
        .eq('student_id', user.id),
      supabase
        .from('plan_tasks')
        .select('id, plan_id, date, subject_id, chapter_id, type, est_minutes, status, rescheduled_from, study_plans!inner(student_id)')
        .eq('study_plans.student_id', user.id)
        .order('date', { ascending: true })
        .limit(60),
      supabase
        .from('burnout_signals')
        .select('level, factors')
        .eq('student_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('productivity_logs')
        .select('date, minutes_studied')
        .eq('student_id', user.id)
        .order('date', { ascending: false })
        .limit(7),
      supabase
        .from('focus_sessions')
        .select('focus_score, started_at')
        .eq('student_id', user.id)
        .order('started_at', { ascending: false })
        .limit(7),
    ])

    // Second batch: queries that depend on goalRes
    const goalId = goalRes.data?.id ?? ''
    const subjectGoalsRes = goalId
      ? await supabase.from('subject_goals').select('subject_id, target_pct').eq('goal_id', goalId)
      : { data: [] }

    const profile = profileRes.data
    if (!profile) return seed

    // XP total
    const totalXp = (xpRes.data ?? []).reduce((sum, e) => sum + (e.amount ?? 0), 0)
    const level = Math.floor(totalXp / 500) + 1

    // Streak
    const streak = streakRes.data ?? { current: 0, longest: 0 }

    // Goal
    const goal = goalRes.data ?? { target_overall_pct: seed.goal.target_overall_pct }

    // Predictions
    const predictions =
      predictionsRes.data && predictionsRes.data.length > 0
        ? predictionsRes.data
        : seed.predictions

    // Subject stats — aggregate mastery per subject
    const subjectStats: DashboardData['subjectStats'] = []
    if (masteryRes.data && masteryRes.data.length > 0) {
      const bySubject: Record<string, number[]> = {}
      for (const row of masteryRes.data) {
        // @ts-expect-error — joined column shape
        const subjectId: string = (row.chapters as { subject_id: string } | null)?.subject_id ?? ''
        if (!subjectId) continue
        bySubject[subjectId] = bySubject[subjectId] ?? []
        bySubject[subjectId].push(row.mastery_pct)
      }
      const targetBySubject: Record<string, number> = {}
      for (const sg of subjectGoalsRes.data ?? []) {
        targetBySubject[sg.subject_id] = sg.target_pct
      }
      for (const [id, values] of Object.entries(bySubject)) {
        const meta = SUBJECT_META[id]
        if (!meta) continue
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        subjectStats.push({
          subject: meta.name,
          mastery: Math.round(avg),
          target: targetBySubject[id] ?? goal.target_overall_pct,
          color: meta.color,
        })
      }
    }

    // Weekly chart from productivity + focus logs
    const weeklyChart: DashboardData['weeklyChart'] = []
    const prodByDate: Record<string, number> = {}
    for (const p of productivityRes.data ?? []) {
      prodByDate[p.date] = p.minutes_studied
    }
    const focusByDate: Record<string, number[]> = {}
    for (const f of focusRes.data ?? []) {
      const d = f.started_at.split('T')[0]
      focusByDate[d] = focusByDate[d] ?? []
      focusByDate[d].push(f.focus_score)
    }
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const minutes = prodByDate[dateStr] ?? 0
      const scores = focusByDate[dateStr] ?? []
      const avgFocus = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      weeklyChart.push({
        day: DAYS[d.getDay()],
        goalHrs: parseFloat((minutes / 60).toFixed(1)),
        focusScore: Math.round(avgFocus),
      })
    }

    // Plan tasks
    const planTasks =
      tasksRes.data && tasksRes.data.length > 0
        ? tasksRes.data.map((t) => ({
            id: t.id,
            plan_id: t.plan_id,
            date: t.date,
            subject_id: t.subject_id,
            chapter_id: t.chapter_id,
            type: t.type,
            est_minutes: t.est_minutes,
            status: t.status,
            rescheduled_from: t.rescheduled_from ?? null,
          }))
        : seed.planTasks

    // Burnout
    const burnout = burnoutRes.data
      ? { level: burnoutRes.data.level, interventions: Object.keys(burnoutRes.data.factors ?? {}) }
      : seed.burnout

    return {
      student: { full_name: profile.full_name },
      goal: { target_overall_pct: goal.target_overall_pct },
      streak,
      xp: totalXp || seed.xp,
      level: totalXp ? level : seed.level,
      predictions,
      subjectStats: subjectStats.length > 0 ? subjectStats : seed.subjectStats,
      weeklyChart: weeklyChart.some((w) => w.goalHrs > 0 || w.focusScore > 0) ? weeklyChart : seed.weeklyChart,
      planTasks,
      burnout,
      recentActivity: seed.recentActivity,
      isRealData: true,
    }
  } catch {
    return seed
  }
}

/**
 * Returns the signed-in user's profile, or the seed student when Supabase
 * isn't configured / no user is signed in (demo mode).
 */
export async function getProfile(): Promise<Profile> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return SEED_STUDENT

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    return data ?? SEED_STUDENT
  } catch {
    return SEED_STUDENT
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    return count ?? 0
  } catch {
    return 0
  }
}

export async function getPlannerData(userId: string) {
  try {
    const supabase = await createClient()

    const { data: plan } = await supabase
      .from('study_plans')
      .select('id')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!plan) return { tasks: SEED_PLAN_TASKS, planId: null }

    const { data: tasks } = await supabase
      .from('plan_tasks')
      .select('id, plan_id, date, subject_id, chapter_id, type, est_minutes, status, rescheduled_from')
      .eq('plan_id', plan.id)
      .order('date', { ascending: true })

    return {
      tasks: tasks && tasks.length > 0 ? tasks : SEED_PLAN_TASKS,
      planId: plan.id,
    }
  } catch {
    return { tasks: SEED_PLAN_TASKS, planId: null }
  }
}

export interface GoalData {
  targetPct: number
  subjectBreakdowns: Record<string, SubjectBreakdown>
  updatedAt: string | null
  isRealData: boolean
}

/** Load the student's active goal and per-subject breakdowns from Supabase. */
export async function getGoalData(): Promise<GoalData> {
  const fallback: GoalData = {
    targetPct: SEED_GOAL.target_overall_pct,
    subjectBreakdowns: {},
    updatedAt: SEED_GOAL.created_at,
    isRealData: false,
  }
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return fallback

    const { data: goal } = await supabase
      .from('goals')
      .select('id, target_overall_pct, created_at')
      .eq('student_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!goal) return { ...fallback, isRealData: true, targetPct: fallback.targetPct, updatedAt: null }

    const { data: subjectGoals } = await supabase
      .from('subject_goals')
      .select('subject_id, target_pct, required_effort_hrs, ai_feasibility, ai_rationale')
      .eq('goal_id', goal.id)

    const subjectBreakdowns: Record<string, SubjectBreakdown> = {}
    for (const sg of subjectGoals ?? []) {
      subjectBreakdowns[sg.subject_id] = {
        targetPct: sg.target_pct,
        requiredEffortHrs: sg.required_effort_hrs,
        feasibility: sg.ai_feasibility as SubjectBreakdown['feasibility'],
        rationale: sg.ai_rationale,
      }
    }

    return {
      targetPct: goal.target_overall_pct,
      subjectBreakdowns,
      updatedAt: goal.created_at,
      isRealData: true,
    }
  } catch {
    return fallback
  }
}

export interface LeaderboardRow {
  id: string
  full_name: string
  avatar_url: string | null
  total_xp: number
  level: number
  rank: number
  isMe: boolean
}

export interface LeaderboardData {
  board: LeaderboardRow[]
  myRank: number | null
  isRealData: boolean
}

/** Fetch XP-ranked leaderboard. Aggregates xp_events per student in JS. */
export async function getLeaderboardData(): Promise<LeaderboardData> {
  const empty: LeaderboardData = { board: [], myRank: null, isRealData: false }
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return empty

    const [profilesRes, xpRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'student')
        .limit(200),
      supabase.from('xp_events').select('student_id, amount'),
    ])

    const profiles = profilesRes.data ?? []
    const xpEvents = xpRes.data ?? []

    // Sum XP per student.
    const xpByStudent: Record<string, number> = {}
    for (const ev of xpEvents) {
      xpByStudent[ev.student_id] = (xpByStudent[ev.student_id] ?? 0) + (ev.amount ?? 0)
    }

    const ranked = profiles
      .map((p) => {
        const total_xp = xpByStudent[p.id] ?? 0
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          total_xp,
          level: Math.floor(total_xp / 500) + 1,
          isMe: p.id === user.id,
        }
      })
      .sort((a, b) => b.total_xp - a.total_xp)
      .map((p, i) => ({ ...p, rank: i + 1 }))

    const myRank = ranked.find((r) => r.isMe)?.rank ?? null

    return { board: ranked, myRank, isRealData: true }
  } catch {
    return empty
  }
}

export interface AchievementWithStatus {
  code: string
  title: string
  desc: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  earned: boolean
  earnedAt: string | null
}

export interface AchievementsData {
  achievements: AchievementWithStatus[]
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  isRealData: boolean
}

/** Evaluate achievement rules against real DB data and return earned/locked status. */
export async function getAchievementsData(): Promise<AchievementsData> {
  const fallback: AchievementsData = {
    achievements: ACHIEVEMENT_DEFS.map((a) => ({ ...a, earned: false, earnedAt: null })),
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    isRealData: false,
  }
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return fallback

    const [xpRes, streakRes, goalsRes, diagRes, masteryRes, attemptsRes, challengesRes] =
      await Promise.all([
        supabase.from('xp_events').select('amount, created_at').eq('student_id', user.id),
        supabase.from('streaks').select('current, longest').eq('student_id', user.id).single(),
        supabase
          .from('goals')
          .select('id, status, created_at')
          .eq('student_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1),
        supabase
          .from('diagnostics')
          .select('id')
          .eq('student_id', user.id)
          .not('completed_at', 'is', null)
          .limit(1),
        supabase
          .from('mastery')
          .select('label')
          .eq('student_id', user.id),
        supabase
          .from('attempts')
          .select('score')
          .eq('student_id', user.id)
          .gte('score', 80)
          .limit(1),
        supabase
          .from('challenge_progress')
          .select('completed, earned_at:updated_at')
          .eq('student_id', user.id)
          .eq('completed', true)
          .limit(1),
      ])

    const xpEvents = xpRes.data ?? []
    const totalXp = xpEvents.reduce((sum, e) => sum + (e.amount ?? 0), 0)
    const level = Math.floor(totalXp / 500) + 1
    const streak = streakRes.data ?? { current: 0, longest: 0 }
    const masteryRows = masteryRes.data ?? []
    const allStrength =
      masteryRows.length > 0 && masteryRows.every((m) => m.label === 'strength')

    // Evaluate each achievement rule.
    function evaluate(code: string): boolean {
      switch (code) {
        case 'first_login':
          return true
        case 'goal_set':
          return (goalsRes.data?.length ?? 0) > 0
        case 'diagnostic_done':
          return (diagRes.data?.length ?? 0) > 0
        case 'xp_500':
          return totalXp >= 500
        case 'xp_5000':
          return totalXp >= 5000
        case 'streak_7':
          return streak.current >= 7 || streak.longest >= 7
        case 'streak_30':
          return streak.current >= 30 || streak.longest >= 30
        case 'mock_test_80':
          return (attemptsRes.data?.length ?? 0) > 0
        case 'week_challenge':
          return (challengesRes.data?.length ?? 0) > 0
        case 'all_chapters_strength':
          return allStrength
        case 'goal_achieved':
          return (goalsRes.data ?? []).some((g) => g.status === 'achieved')
        default:
          return false
      }
    }

    const achievements: AchievementWithStatus[] = ACHIEVEMENT_DEFS.map((a) => ({
      ...a,
      earned: evaluate(a.code),
      earnedAt: null,
    }))

    return {
      achievements,
      totalXp,
      level,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      isRealData: true,
    }
  } catch {
    return fallback
  }
}
