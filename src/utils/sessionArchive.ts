import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import type { Session } from '@/types/types'

/**
 * Archives a user session to session_history collection and removes from active sessions
 * This preserves session data for analytics while cleaning up active presence
 */
export const archiveSession = async (session: Session): Promise<void> => {
  try {
    // Calculate session duration if session was started
    let sessionDuration = 0
    let completedSession = false

    if (session.sessionStartTime) {
      completedSession = true
      sessionDuration = Math.floor(
        (Date.now() - session.sessionStartTime.toMillis()) / 1000
      )
    }

    // Create session history record
    const sessionHistory = {
      originalSessionId: session.id, // Store original session ID
      name: session.name,
      sessionStartTime: session.sessionStartTime,
      sessionEndTime: Timestamp.now(),
      sessionDuration,
      completedSession,
      leftAt: serverTimestamp() as Timestamp,
    }

    // Add to session_history collection
    await addDoc(collection(db, 'session_history'), sessionHistory)

    // Remove from active sessions
    await deleteDoc(doc(db, 'sessions', session.id))
    console.log('Active session removed:', session.id)
  } catch (error) {
    console.error('Failed to archive session:', error)
    // Re-throw to allow caller to handle the error
    throw new Error(
      error instanceof Error
        ? `Session archiving failed: ${error.message}`
        : 'Unknown error during session archiving'
    )
  }
}

/**
 * Calculates session duration from start time to current time
 */
export const calculateSessionDuration = (
  sessionStartTime: Timestamp | null
): number => {
  if (!sessionStartTime) return 0
  return Math.floor((Date.now() - sessionStartTime.toMillis()) / 1000)
}

/**
 * Formats session duration into human-readable string
 */
export const formatSessionDuration = (durationSeconds: number): string => {
  if (durationSeconds < 60) {
    return `${durationSeconds}s`
  }

  const minutes = Math.floor(durationSeconds / 60)
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
