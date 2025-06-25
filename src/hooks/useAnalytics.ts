import { useState, useEffect, useCallback } from 'react'
import { AnalyticsService } from '@/services/analyticsService'
import type { LiveStats, HourlyActivity } from '@/types/analytics'

interface UseAnalyticsReturn {
  liveStats: LiveStats | null
  hourlyActivity: HourlyActivity[]
  retentionStats: {
    totalUniqueUsers: number
    returningUsers: number
    retentionRate: number
  } | null
  completionStats: {
    totalSessions: number
    completedSessions: number
    completionRate: number
  } | null
  isLoading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

/**
 * React hook for fetching and managing analytics data
 * Provides caching and automatic refresh capabilities
 */
export const useAnalytics = (
  autoRefreshInterval?: number
): UseAnalyticsReturn => {
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([])
  const [retentionStats, setRetentionStats] = useState<{
    totalUniqueUsers: number
    returningUsers: number
    retentionRate: number
  } | null>(null)
  const [completionStats, setCompletionStats] = useState<{
    totalSessions: number
    completedSessions: number
    completionRate: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analyticsService = AnalyticsService.getInstance()

  /**
   * Fetch all analytics data
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [liveStatsData, hourlyActivityData, retentionData, completionData] =
        await Promise.all([
          analyticsService.getLiveStats(),
          analyticsService.getTodayHourlyActivity(),
          analyticsService.getUserRetentionStats(),
          analyticsService.getSessionCompletionRate(),
        ])

      setLiveStats(liveStatsData)
      setHourlyActivity(hourlyActivityData)
      setRetentionStats(retentionData)
      setCompletionStats(completionData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to fetch analytics'
      )
    } finally {
      setIsLoading(false)
    }
  }, [analyticsService])

  /**
   * Refresh stats and clear cache
   */
  const refreshStats = useCallback(async () => {
    analyticsService.clearCache()
    await fetchAnalytics()
  }, [analyticsService, fetchAnalytics])

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto refresh interval
  useEffect(() => {
    if (!autoRefreshInterval) return

    const interval = setInterval(() => {
      fetchAnalytics()
    }, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [autoRefreshInterval, fetchAnalytics])

  return {
    liveStats,
    hourlyActivity,
    retentionStats,
    completionStats,
    isLoading,
    error,
    refreshStats,
  }
}
