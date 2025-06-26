import { Timestamp } from 'firebase/firestore'

/**
 * Core analytics data structures for Firebase-based statistics
 */

export interface SessionAnalytics {
  id: string
  userId: string // Generated identifier for user tracking
  sessionDuration: number // in seconds, 0 if session not completed
  startTime: Timestamp
  endTime: Timestamp | null
  completed: boolean // true if session was properly ended
  feedback?: {
    rating: 'bad' | 'decent' | 'love'
    hasText: boolean
  }
}

export interface DailyStats {
  date: string // YYYY-MM-DD format
  activeUsers: number
  totalSessions: number
  completedSessions: number
  totalStudyTime: number // in seconds
  averageSessionLength: number // in seconds
  feedbackCount: number
  peakHour: number // 0-23, hour with most activity
}

export interface UserStats {
  userId: string
  firstSeen: Timestamp
  lastSeen: Timestamp
  totalSessions: number
  completedSessions: number
  totalStudyTime: number // in seconds
  averageSessionLength: number
  feedbackCount: number
}

export interface LiveStats {
  currentActiveUsers: number
  todayActiveUsers: number
  todayTotalStudyTime: number
  todayCompletedSessions: number
  todayAverageSession: number
  allTimeTotalStudyTime: number
  allTimeCompletedSessions: number
  allTimeUniqueUsers: number
  totalFeedbackSubmitted: number
}

export interface HourlyActivity {
  hour: number // 0-23
  sessions: number
  activeUsers: number
}

export interface AnalyticsConfig {
  enableTracking: boolean
  dataRetentionDays: number // How long to keep detailed analytics
  aggregationIntervals: ('hourly' | 'daily' | 'weekly')[]
}
