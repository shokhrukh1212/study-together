import { useState, useEffect, useCallback } from 'react'
import {
  CollectionReference,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import type { Session } from '@/types/types'
import { archiveSession } from '@/utils/sessionArchive'
import { saveCompletedSession } from '@/utils/completedSessions'

interface UseFirebaseSessionReturn {
  currentUser: Session | null
  allUsers: Session[]
  totalOnline: number
  isLoading: boolean
  error: string | null
  joinRoom: (name: string) => Promise<void>
  startSession: () => Promise<void>
  endSession: () => Promise<void>
  leaveRoom: () => Promise<void>
  showFeedbackModal: boolean
  sessionDuration: number
  closeFeedbackModal: () => void
  isJoining: boolean
  isLeaving: boolean
}

/**
 * Firebase-only session management hook
 * Handles real-time sessions with persistence
 */
export const useFirebaseSession = (
  sessionsRef: CollectionReference
): UseFirebaseSessionReturn => {
  const [currentUser, setCurrentUser] = useState<Session | null>(null)
  const [allUsers, setAllUsers] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const updateUserHeartbeat = useCallback(async (userId: string) => {
    try {
      await updateDoc(doc(db, 'sessions', userId), {
        lastSeen: serverTimestamp(),
      })
    } catch (error) {
      console.error('Failed to update heartbeat:', error)
    }
  }, [])

  // Real-time listener for all sessions
  useEffect(() => {
    const q = query(sessionsRef, orderBy('lastSeen', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const sessions: Session[] = []
        snapshot.forEach(doc => {
          sessions.push({
            id: doc.id,
            ...doc.data(),
          } as Session)
        })

        setAllUsers(sessions)
        setIsLoading(false)
        setError(null)

        // Only update currentUser from Firebase if we're not in the middle of joining
        if (!isJoining && !isLeaving) {
          const savedUserId = localStorage.getItem('study-app-user-id')
          if (savedUserId) {
            const savedUser = sessions.find(user => user.id === savedUserId)
            if (savedUser) {
              // Update currentUser with latest Firebase data only if different
              setCurrentUser(prevUser => {
                // Only update if the user data actually changed
                if (
                  !prevUser ||
                  prevUser.id !== savedUser.id ||
                  prevUser.status !== savedUser.status ||
                  prevUser.name !== savedUser.name
                ) {
                  return savedUser
                }

                // Check sessionStartTime with proper Timestamp comparison
                const prevTime = prevUser.sessionStartTime?.toMillis() || null
                const newTime = savedUser.sessionStartTime?.toMillis() || null
                if (prevTime !== newTime) {
                  return savedUser
                }

                return prevUser // No actual change, prevent unnecessary re-render
              })
              // NOTE: Removed updateUserHeartbeat here to prevent infinite loop
              // Heartbeat is handled by separate interval in different useEffect
            } else {
              // User not found in Firebase, clean up
              localStorage.removeItem('study-app-user-id')
              setCurrentUser(null)
            }
          }
        }
      },
      err => {
        console.error('Firebase listener error:', err)
        setError('Failed to load sessions')
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [sessionsRef, isJoining, isLeaving])

  const joinRoom = useCallback(
    async (name: string) => {
      setIsJoining(true)

      try {
        setIsLoading(true)
        setError(null)

        const currentTime = Timestamp.now()
        const newSession = {
          name: name.trim(),
          status: 'idle' as const,
          sessionStartTime: null,
          lastSeen: serverTimestamp(),
        }

        const docRef = await addDoc(sessionsRef, newSession)
        localStorage.setItem('study-app-user-id', docRef.id)

        // Set currentUser immediately for UI responsiveness
        const newUser: Session = {
          id: docRef.id,
          name: name.trim(),
          status: 'idle' as const,
          sessionStartTime: null,
          lastSeen: currentTime, // Use actual Timestamp instead of FieldValue
        }
        setCurrentUser(newUser)

        // Send initial heartbeat after successful join
        updateUserHeartbeat(docRef.id)
        setIsLoading(false)
        setIsJoining(false)
      } catch (error) {
        console.error('Failed to join room:', error)
        setError('Failed to join room')
        setIsLoading(false)
        setIsJoining(false)
      }
    },
    [sessionsRef, updateUserHeartbeat]
  )

  const startSession = useCallback(async () => {
    if (!currentUser) return

    try {
      // Batch operation: combine status, sessionStart, and heartbeat in single write
      await updateDoc(doc(db, 'sessions', currentUser.id), {
        status: 'active',
        sessionStartTime: serverTimestamp(),
        lastSeen: serverTimestamp(), // Combined heartbeat update
      })
    } catch (error) {
      console.error('Failed to start session:', error)
      setError('Failed to start session')
    }
  }, [currentUser])

  const endSession = useCallback(async () => {
    if (!currentUser || !currentUser.sessionStartTime) return

    try {
      const sessionEndTime = Timestamp.now()
      const duration = Math.floor(
        (sessionEndTime.toMillis() - currentUser.sessionStartTime.toMillis()) /
          1000
      )
      setSessionDuration(duration)

      // Save the completed session to completed_sessions collection
      await saveCompletedSession(
        currentUser,
        currentUser.sessionStartTime,
        sessionEndTime
      )

      // Update the current session status (reset to idle)
      await updateDoc(doc(db, 'sessions', currentUser.id), {
        status: 'idle',
        sessionStartTime: null,
        lastSeen: serverTimestamp(),
      })

      // Show feedback modal if session was at least 30 seconds long
      if (duration >= 30) {
        setShowFeedbackModal(true)
      }
    } catch (error) {
      console.error('Failed to end session:', error)
      setError('Failed to end session')
    }
  }, [currentUser])

  const leaveRoom = useCallback(async () => {
    if (!currentUser) return

    try {
      setIsLeaving(true)
      // Remove user from local state immediately for UI responsiveness
      setCurrentUser(null)
      localStorage.removeItem('study-app-user-id')

      // Archive session instead of deleting to preserve data for analytics
      await archiveSession(currentUser)
      setIsLeaving(false)
    } catch (error) {
      console.error('Failed to leave room:', error)
      setError('Failed to leave room')
      setIsLeaving(false)
    }
  }, [currentUser])

  // Smart heartbeat system with visibility detection
  useEffect(() => {
    if (!currentUser) return

    const HEARTBEAT_INTERVAL = 120000 // 2 minutes = 75% cost reduction
    let interval: NodeJS.Timeout

    const startHeartbeat = () => {
      interval = setInterval(() => {
        // Only send heartbeat if tab is visible (saves writes when tab is hidden)
        if (!document.hidden) {
          updateUserHeartbeat(currentUser.id)
        }
      }, HEARTBEAT_INTERVAL)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became hidden - clear interval to save writes
        if (interval) clearInterval(interval)
      } else {
        // Tab became visible - resume heartbeat and send immediate update
        updateUserHeartbeat(currentUser.id)
        startHeartbeat()
      }
    }

    // Start initial heartbeat
    startHeartbeat()

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (interval) clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUser, updateUserHeartbeat])

  // Cleanup on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        navigator.sendBeacon(
          `data:application/json,${JSON.stringify({ cleanup: currentUser.id })}`
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentUser])

  /**
   * Closes the feedback modal
   */
  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false)
    setSessionDuration(0)
  }, [])

  return {
    currentUser,
    allUsers,
    totalOnline: allUsers.length,
    isLoading,
    error,
    joinRoom,
    startSession,
    endSession,
    leaveRoom,
    showFeedbackModal,
    sessionDuration,
    closeFeedbackModal,
    isJoining,
    isLeaving,
  }
}
