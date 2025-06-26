import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import type { LiveStats, HourlyActivity } from '@/types/analytics'
import type { Session, CompletedSession } from '@/types/types'

/**
 * Analytics service for collecting and calculating user statistics from Firebase
 * Now uses completed_sessions collection as primary data source for accurate statistics
 */
export class AnalyticsService {
  private static instance: AnalyticsService
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Get cached data or fetch fresh if expired
   */
  private async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T
    }

    const data = await fetchFn()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }

  /**
   * Get timestamp for start of today
   */
  private getTodayStart(): Timestamp {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Timestamp.fromDate(today)
  }

  /**
   * Get all completed sessions from Firebase
   */
  private async getAllCompletedSessions(): Promise<CompletedSession[]> {
    const completedSessionsRef = collection(db, 'completed_sessions')
    const snapshot = await getDocs(completedSessionsRef)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CompletedSession[]
  }

  /**
   * Get today's completed sessions
   */
  private async getTodayCompletedSessions(): Promise<CompletedSession[]> {
    const todayStart = this.getTodayStart()
    const completedSessionsRef = collection(db, 'completed_sessions')

    const q = query(
      completedSessionsRef,
      where('completedAt', '>=', todayStart),
      orderBy('completedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CompletedSession[]
  }

  /**
   * Get currently active users from sessions collection
   */
  private async getCurrentActiveUsers(): Promise<Session[]> {
    const sessionsRef = collection(db, 'sessions')
    const snapshot = await getDocs(sessionsRef)

    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[]

    // Filter to users seen in last 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return sessions.filter(
      session => session.lastSeen.toMillis() > fiveMinutesAgo
    )
  }

  /**
   * Get feedback count
   */
  private async getFeedbackCount(): Promise<number> {
    const feedbackRef = collection(db, 'feedback')
    const snapshot = await getDocs(feedbackRef)
    return snapshot.size
  }

  /**
   * Calculate live statistics using completed_sessions as primary data source
   */
  public async getLiveStats(): Promise<LiveStats> {
    return this.getCachedOrFetch('liveStats', async () => {
      const [
        allCompletedSessions,
        todayCompletedSessions,
        currentActiveUsers,
        totalFeedback,
      ] = await Promise.all([
        this.getAllCompletedSessions(),
        this.getTodayCompletedSessions(),
        this.getCurrentActiveUsers(),
        this.getFeedbackCount(),
      ])

      // Today's stats from completed sessions
      const todayTotalStudyTime = todayCompletedSessions.reduce(
        (total, session) => total + session.sessionDuration,
        0
      )

      const todayAverageSession =
        todayCompletedSessions.length > 0
          ? Math.round(todayTotalStudyTime / todayCompletedSessions.length)
          : 0

      // All-time stats from completed sessions
      const allTimeTotalStudyTime = allCompletedSessions.reduce(
        (total, session) => total + session.sessionDuration,
        0
      )

      // Count unique users who have completed sessions today
      const todayUniqueUsers = new Set(
        todayCompletedSessions.map(session => session.userId)
      ).size

      // Count all-time unique users who have ever completed a session
      const allTimeUniqueUsers = new Set(
        allCompletedSessions.map(session => session.userId)
      ).size

      return {
        currentActiveUsers: currentActiveUsers.length,
        todayActiveUsers: todayUniqueUsers,
        todayTotalStudyTime,
        todayCompletedSessions: todayCompletedSessions.length,
        todayAverageSession,
        allTimeTotalStudyTime,
        allTimeCompletedSessions: allCompletedSessions.length,
        allTimeUniqueUsers,
        totalFeedbackSubmitted: totalFeedback,
      }
    })
  }

  /**
   * Get hourly activity breakdown for today using completed sessions
   */
  public async getTodayHourlyActivity(): Promise<HourlyActivity[]> {
    return this.getCachedOrFetch('hourlyActivity', async () => {
      const todayCompletedSessions = await this.getTodayCompletedSessions()

      const hourlyData: {
        [hour: number]: { sessions: number; users: Set<string> }
      } = {}

      // Initialize all hours
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { sessions: 0, users: new Set() }
      }

      // Count completed sessions and unique users per hour
      todayCompletedSessions.forEach(session => {
        const hour = session.startTime.toDate().getHours()
        hourlyData[hour].sessions++
        hourlyData[hour].users.add(session.userId)
      })

      // Convert to array format
      return Object.entries(hourlyData).map(([hour, data]) => ({
        hour: parseInt(hour),
        sessions: data.sessions,
        activeUsers: data.users.size,
      }))
    })
  }

  /**
   * Get user retention stats using completed sessions
   */
  public async getUserRetentionStats(): Promise<{
    totalUniqueUsers: number
    returningUsers: number
    retentionRate: number
  }> {
    return this.getCachedOrFetch('retentionStats', async () => {
      const allCompletedSessions = await this.getAllCompletedSessions()

      // Group sessions by user ID
      const userSessions: { [userId: string]: CompletedSession[] } = {}
      allCompletedSessions.forEach(session => {
        if (!userSessions[session.userId]) {
          userSessions[session.userId] = []
        }
        userSessions[session.userId].push(session)
      })

      const totalUniqueUsers = Object.keys(userSessions).length
      const returningUsers = Object.values(userSessions).filter(
        sessions => sessions.length > 1
      ).length

      const retentionRate =
        totalUniqueUsers > 0
          ? Math.round((returningUsers / totalUniqueUsers) * 100)
          : 0

      return {
        totalUniqueUsers,
        returningUsers,
        retentionRate,
      }
    })
  }

  /**
   * Get session completion rate
   * Compares total people who joined vs people who completed at least one session
   */
  public async getSessionCompletionRate(): Promise<{
    totalSessions: number
    completedSessions: number
    completionRate: number
  }> {
    return this.getCachedOrFetch('completionRate', async () => {
      // Get all sessions (people who joined)
      const sessionsRef = collection(db, 'sessions')
      const sessionHistoryRef = collection(db, 'session_history')

      const [sessionsSnapshot, historySnapshot, completedSessions] =
        await Promise.all([
          getDocs(sessionsRef),
          getDocs(sessionHistoryRef),
          this.getAllCompletedSessions(),
        ])

      const totalSessions = sessionsSnapshot.size + historySnapshot.size
      const actualCompletedSessions = completedSessions.length

      const completionRate =
        totalSessions > 0
          ? Math.round((actualCompletedSessions / totalSessions) * 100)
          : 0

      return {
        totalSessions,
        completedSessions: actualCompletedSessions,
        completionRate,
      }
    })
  }

  /**
   * Clear cache to force fresh data fetch
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Format duration in human-readable format
   */
  public formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}m`
  }

  /**
   * Format large numbers with K, M suffixes
   */
  public formatNumber(num: number): string {
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }
}
