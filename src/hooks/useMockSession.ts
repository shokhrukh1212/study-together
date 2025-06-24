import { useState, useCallback } from 'react'
import { Timestamp } from 'firebase/firestore'
import type { Session } from '@/types/types'

interface UseMockSessionReturn {
  currentUser: Session | null
  allUsers: Session[]
  totalOnline: number
  isLoading: boolean
  error: string | null
  joinRoom: (name: string) => Promise<void>
  startSession: () => Promise<void>
  endSession: () => Promise<void>
  leaveRoom: () => Promise<void>
}

/**
 * Mock session hook for development when Firebase quota is exhausted
 * Provides same interface as useFirebaseSession but with mock data
 */
export const useMockSession = (): UseMockSessionReturn => {
  const [currentUser, setCurrentUser] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock users for testing
  const mockUsers: Session[] = [
    {
      id: '1',
      name: 'Alice',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(
        new Date(Date.now() - 15 * 60 * 1000)
      ), // 15 min ago
      lastSeen: Timestamp.now(),
    },
    {
      id: '2',
      name: 'Bob',
      status: 'idle',
      sessionStartTime: null,
      lastSeen: Timestamp.now(),
    },
    {
      id: '3',
      name: 'Charlie',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(
        new Date(Date.now() - 8 * 60 * 1000)
      ), // 8 min ago
      lastSeen: Timestamp.now(),
    },
  ]

  const allUsers = currentUser ? [...mockUsers, currentUser] : mockUsers

  const joinRoom = useCallback(async (name: string) => {
    console.log('🎭 Mock: Joining room with name:', name)
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const newUser: Session = {
      id: Date.now().toString(),
      name: name.trim(),
      status: 'idle',
      sessionStartTime: null,
      lastSeen: Timestamp.now(),
    }

    setCurrentUser(newUser)
    setIsLoading(false)
    console.log('🎭 Mock: User joined successfully')
  }, [])

  const startSession = useCallback(async () => {
    if (!currentUser) return

    console.log('🎭 Mock: Starting session')
    setCurrentUser({
      ...currentUser,
      status: 'active',
      sessionStartTime: Timestamp.now(),
    })
  }, [currentUser])

  const endSession = useCallback(async () => {
    if (!currentUser) return

    console.log('🎭 Mock: Ending session')
    setCurrentUser({
      ...currentUser,
      status: 'idle',
      sessionStartTime: null,
    })
  }, [currentUser])

  const leaveRoom = useCallback(async () => {
    console.log('🎭 Mock: Leaving room')
    setCurrentUser(null)
  }, [])

  return {
    currentUser,
    allUsers,
    totalOnline: allUsers.length,
    isLoading,
    error: null,
    joinRoom,
    startSession,
    endSession,
    leaveRoom,
  }
}
