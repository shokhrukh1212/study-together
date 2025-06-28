import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import type { Session, CompletedSession } from '@/types/types'

/**
 * Generate or retrieve a unique user ID for session tracking
 * This persists across browser sessions to track returning users
 */
const getUserId = (): string => {
  const STORAGE_KEY = 'study-app-user-uuid'
  let userId = localStorage.getItem(STORAGE_KEY)

  if (!userId) {
    // Generate a unique ID: timestamp + random string
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEY, userId)
  }

  return userId
}

/**
 * Save a completed study session to the completed_sessions collection
 * This is called every time a user ends a study session
 */
export const saveCompletedSession = async (
  currentUser: Session,
  sessionStartTime: Timestamp,
  sessionEndTime: Timestamp
): Promise<void> => {
  try {
    const sessionDuration = Math.floor(
      (sessionEndTime.toMillis() - sessionStartTime.toMillis()) / 1000
    )

    // Don't save sessions shorter than 5 seconds (likely accidental clicks)
    if (sessionDuration < 5) {
      return
    }

    const completedSession: Omit<CompletedSession, 'id'> = {
      userId: getUserId(),
      userName: currentUser.name,
      sessionDuration,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      completedAt: serverTimestamp() as Timestamp,
    }

    await addDoc(collection(db, 'completed_sessions'), completedSession)
  } catch (error) {
    console.error('❌ Failed to save completed session:', error)
    // Don't throw error to prevent disrupting user experience
  }
}

/**
 * Format duration in human-readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}m`
}

/**
 * Get the current user's ID for analytics
 */
export const getCurrentUserId = (): string => {
  return getUserId()
}
