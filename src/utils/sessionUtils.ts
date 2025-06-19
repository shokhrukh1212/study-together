import type { Session } from '@/types/types'
import { Timestamp } from 'firebase/firestore'

/**
 * Creates a Firebase Timestamp from current time
 * Helper function to ensure consistent timestamp creation
 */
const createTimestamp = (): Timestamp => {
  return Timestamp.now()
}

/**
 * Creates a new user session with initial idle state
 * Used when a user joins the study room for the first time
 */
export const createUserSession = (name: string): Session => {
  return {
    id: crypto.randomUUID(),
    name,
    status: 'idle',
    sessionStartTime: null,
    lastSeen: createTimestamp(),
  }
}

/**
 * Updates user session to active state with start time
 * Used when user clicks "Start Study Session" button
 */
export const startUserSession = (user: Session): Session => {
  return {
    ...user,
    status: 'active',
    sessionStartTime: createTimestamp(),
  }
}

/**
 * Updates user session back to idle state
 * Used when user clicks "End Study Session" button
 */
export const endUserSession = (user: Session): Session => {
  return {
    ...user,
    status: 'idle',
    sessionStartTime: null,
  }
}
