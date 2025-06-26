import { useAnalytics } from '@/hooks/useAnalytics'
import { AnalyticsService } from '@/services/analyticsService'

interface StatsDashboardProps {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

/**
 * Admin-only analytics dashboard showing comprehensive user statistics
 * Displays live stats, engagement metrics, and usage patterns
 */
export const StatsDashboard = ({
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
}: StatsDashboardProps) => {
  const {
    liveStats,
    hourlyActivity,
    retentionStats,
    completionStats,
    isLoading,
    error,
    refreshStats,
  } = useAnalytics(autoRefresh ? refreshInterval : undefined)

  const analyticsService = AnalyticsService.getInstance()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary-text/70">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-text mb-4">
            Analytics Error
          </h1>
          <p className="text-primary-text/70 mb-4">{error}</p>
          <button
            onClick={refreshStats}
            className="bg-accent text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-accent/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const findPeakHour = () => {
    if (!hourlyActivity.length) return 'No data'
    const peak = hourlyActivity.reduce((max, current) =>
      current.sessions > max.sessions ? current : max
    )
    return `${peak.hour}:00 (${peak.sessions} sessions)`
  }

  return (
    <div className="min-h-screen bg-primary-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-text mb-2">
              StudyTogether Analytics
            </h1>
            <p className="text-primary-text/70">
              Admin dashboard • User engagement and usage statistics
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshStats}
              className="bg-accent text-slate-900 px-4 py-2 rounded-xl font-semibold hover:bg-accent/90 transition-all duration-200"
            >
              🔄 Refresh
            </button>
            <a
              href="/"
              className="bg-slate-700 text-primary-text px-4 py-2 rounded-xl font-semibold hover:bg-slate-600 transition-all duration-200"
            >
              ← Back to App
            </a>
          </div>
        </div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Active Users */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-primary-text/70 text-sm font-medium">
                Active Now
              </h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-3xl font-bold text-accent">
              {liveStats?.currentActiveUsers || 0}
            </p>
            <p className="text-primary-text/60 text-sm mt-1">users online</p>
          </div>

          {/* Today Active Users */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-primary-text/70 text-sm font-medium mb-2">
              Today's Active Users
            </h3>
            <p className="text-3xl font-bold text-primary-text">
              {liveStats?.todayActiveUsers || 0}
            </p>
            <p className="text-primary-text/60 text-sm mt-1">
              unique users today
            </p>
          </div>

          {/* Today's Study Time */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-primary-text/70 text-sm font-medium mb-2">
              Today's Study Time
            </h3>
            <p className="text-3xl font-bold text-primary-text">
              {analyticsService.formatDuration(
                liveStats?.todayTotalStudyTime || 0
              )}
            </p>
            <p className="text-primary-text/60 text-sm mt-1">
              total focus time
            </p>
          </div>

          {/* Today's Average Session */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-primary-text/70 text-sm font-medium mb-2">
              Avg Session Today
            </h3>
            <p className="text-3xl font-bold text-primary-text">
              {analyticsService.formatDuration(
                liveStats?.todayAverageSession || 0
              )}
            </p>
            <p className="text-primary-text/60 text-sm mt-1">average length</p>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Session Completion Rate */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              Session Completion
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-primary-text/70">Total Sessions</span>
                <span className="text-primary-text font-medium">
                  {completionStats?.totalSessions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-text/70">Completed</span>
                <span className="text-primary-text font-medium">
                  {completionStats?.completedSessions || 0}
                </span>
              </div>
              <div className="pt-2 border-t border-primary-text/10">
                <div className="flex justify-between items-center">
                  <span className="text-primary-text/70">Completion Rate</span>
                  <span className="text-accent text-xl font-bold">
                    {completionStats?.completionRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${completionStats?.completionRate || 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* User Retention */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              User Retention
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-primary-text/70">Total Users</span>
                <span className="text-primary-text font-medium">
                  {retentionStats?.totalUniqueUsers || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-text/70">Returning Users</span>
                <span className="text-primary-text font-medium">
                  {retentionStats?.returningUsers || 0}
                </span>
              </div>
              <div className="pt-2 border-t border-primary-text/10">
                <div className="flex justify-between items-center">
                  <span className="text-primary-text/70">Retention Rate</span>
                  <span className="text-accent text-xl font-bold">
                    {retentionStats?.retentionRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${retentionStats?.retentionRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* All-Time Stats */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">
              All-Time Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-primary-text/70">Total Study Time</span>
                <span className="text-primary-text font-medium">
                  {analyticsService.formatDuration(
                    liveStats?.allTimeTotalStudyTime || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-text/70">Completed Sessions</span>
                <span className="text-primary-text font-medium">
                  {analyticsService.formatNumber(
                    liveStats?.allTimeCompletedSessions || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-text/70">Unique Users</span>
                <span className="text-primary-text font-medium">
                  {analyticsService.formatNumber(
                    liveStats?.allTimeUniqueUsers || 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-text/70">Feedback Submitted</span>
                <span className="text-primary-text font-medium">
                  {liveStats?.totalFeedbackSubmitted || 0}
                </span>
              </div>
              <div className="pt-2 border-t border-primary-text/10">
                <div className="flex justify-between items-center">
                  <span className="text-primary-text/70">Peak Hour Today</span>
                  <span className="text-accent font-bold">
                    {findPeakHour()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Activity Chart */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-primary-text mb-6">
            Today's Hourly Activity
          </h3>
          <div className="grid grid-cols-12 gap-2 h-32">
            {hourlyActivity.map(hour => {
              const maxSessions = Math.max(
                ...hourlyActivity.map(h => h.sessions),
                1
              )
              const height = (hour.sessions / maxSessions) * 100

              return (
                <div key={hour.hour} className="flex flex-col items-center">
                  <div className="flex-1 flex items-end">
                    <div
                      className="bg-accent rounded-t w-full min-h-[4px] transition-all duration-500"
                      style={{ height: `${height}%` }}
                      title={`${hour.hour}:00 - ${hour.sessions} sessions, ${hour.activeUsers} users`}
                    ></div>
                  </div>
                  <span className="text-xs text-primary-text/60 mt-2">
                    {hour.hour}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-primary-text/60 mt-2">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-primary-text/50 text-sm">
          <p>
            Data refreshes automatically every minute • Last updated:{' '}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}
