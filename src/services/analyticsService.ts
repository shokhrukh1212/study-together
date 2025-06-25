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
import type { Session } from '@/types/types'

/**
 * Analytics service for collecting and calculating user statistics from Firebase
 * Uses existing sessions and feedback collections for data source
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
   * Calculate session duration from session data
   */
  private calculateSessionDuration(session: Session): number {
    if (!session.sessionStartTime) return 0

    // Use lastSeen as end time for active sessions, or current time
    const endTime =
      session.status === 'idle' ? session.lastSeen.toMillis() : Date.now()

    return Math.floor((endTime - session.sessionStartTime.toMillis()) / 1000)
  }

  /**
   * Get all sessions from Firebase
   */
  private async getAllSessions(): Promise<Session[]> {
    const sessionsRef = collection(db, 'sessions')
    const snapshot = await getDocs(sessionsRef)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[]
  }

  /**
   * Get today's sessions
   */
  private async getTodaySessions(): Promise<Session[]> {
    const sessionsRef = collection(db, 'sessions')
    const todayStart = this.getTodayStart()

    const q = query(
      sessionsRef,
      where('lastSeen', '>=', todayStart),
      orderBy('lastSeen', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Session[]
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
   * Calculate live statistics
   */
  public async getLiveStats(): Promise<LiveStats> {
    return this.getCachedOrFetch('liveStats', async () => {
      const [allSessions, todaySessions, totalFeedback] = await Promise.all([
        this.getAllSessions(),
        this.getTodaySessions(),
        this.getFeedbackCount(),
      ])

      // Current active users (sessions created in last 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      const currentActiveUsers = allSessions.filter(
        session => session.lastSeen.toMillis() > fiveMinutesAgo
      ).length

      // Today's stats
      const todayCompletedSessions = todaySessions.filter(
        session => session.sessionStartTime !== null
      )

      const todayTotalStudyTime = todayCompletedSessions.reduce(
        (total, session) => total + this.calculateSessionDuration(session),
        0
      )

      const todayAverageSession =
        todayCompletedSessions.length > 0
          ? Math.round(todayTotalStudyTime / todayCompletedSessions.length)
          : 0

      // All-time stats
      const allCompletedSessions = allSessions.filter(
        session => session.sessionStartTime !== null
      )

      const allTimeTotalStudyTime = allCompletedSessions.reduce(
        (total, session) => total + this.calculateSessionDuration(session),
        0
      )

      return {
        currentActiveUsers,
        todayActiveUsers: todaySessions.length,
        todayTotalStudyTime,
        todayCompletedSessions: todayCompletedSessions.length,
        todayAverageSession,
        allTimeTotalStudyTime,
        allTimeCompletedSessions: allCompletedSessions.length,
        totalFeedbackSubmitted: totalFeedback,
      }
    })
  }

  /**
   * Get hourly activity breakdown for today
   */
  public async getTodayHourlyActivity(): Promise<HourlyActivity[]> {
    return this.getCachedOrFetch('hourlyActivity', async () => {
      const todaySessions = await this.getTodaySessions()

      const hourlyData: {
        [hour: number]: { sessions: number; users: Set<string> }
      } = {}

      // Initialize all hours
      for (let i = 0; i < 24; i++) {
        hourlyData[i] = { sessions: 0, users: new Set() }
      }

      // Count sessions and unique users per hour
      todaySessions.forEach(session => {
        if (session.sessionStartTime) {
          const hour = session.sessionStartTime.toDate().getHours()
          hourlyData[hour].sessions++
          hourlyData[hour].users.add(session.name) // Use name as user identifier
        }
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
   * Get user retention stats (users with multiple sessions)
   */
  public async getUserRetentionStats(): Promise<{
    totalUniqueUsers: number
    returningUsers: number
    retentionRate: number
  }> {
    return this.getCachedOrFetch('retentionStats', async () => {
      const allSessions = await this.getAllSessions()

      // Group sessions by user name (our user identifier)
      const userSessions: { [name: string]: Session[] } = {}
      allSessions.forEach(session => {
        if (!userSessions[session.name]) {
          userSessions[session.name] = []
        }
        userSessions[session.name].push(session)
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
   */
  public async getSessionCompletionRate(): Promise<{
    totalSessions: number
    completedSessions: number
    completionRate: number
  }> {
    return this.getCachedOrFetch('completionRate', async () => {
      const allSessions = await this.getAllSessions()

      const totalSessions = allSessions.length
      const completedSessions = allSessions.filter(
        session => session.sessionStartTime !== null
      ).length

      const completionRate =
        totalSessions > 0
          ? Math.round((completedSessions / totalSessions) * 100)
          : 0

      return {
        totalSessions,
        completedSessions,
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
