import { useState } from 'react'
import type { AppState, Session } from '@/types/types'
import { Timestamp } from 'firebase/firestore'

/**
 * Custom hook to manage the main application state
 * Handles view transitions between lobby and study room
 * Manages user sessions and online count
 */
export const useAppState = () => {
  // Create mock users for testing
  const mockUsers: Session[] = [
    {
      id: 'mock-1',
      name: 'Alice Wonderland',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 4365000)), // 1h 12m 45s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-2',
      name: 'Bob The Builder',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 2839000)), // 47m 19s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-3',
      name: 'Charlie Brown',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 7435000)), // 2h 3m 55s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-4',
      name: 'Diana Prince',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 902000)), // 15m 2s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-5',
      name: 'Alice Wonderland',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 4365000)), // 1h 12m 45s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-6',
      name: 'Bob The Builder',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 2839000)), // 47m 19s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-7',
      name: 'Charlie Brown',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 7435000)), // 2h 3m 55s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
    {
      id: 'mock-8',
      name: 'Diana Prince',
      status: 'active',
      sessionStartTime: Timestamp.fromDate(new Date(Date.now() - 902000)), // 15m 2s ago
      lastSeen: Timestamp.fromDate(new Date()),
    },
  ]

  const [appState, setAppState] = useState<AppState>({
    view: 'lobby',
    currentUser: null,
    allUsers: mockUsers, // Add mock users for testing
    totalOnline: 8, // Set to 4 to show the users
  })

  /**
   * Transitions from lobby to study room when user joins
   * Adds the new user to the active users list
   */
  const switchToStudyRoom = (user: Session) => {
    setAppState(prev => ({
      ...prev,
      view: 'study-room',
      currentUser: user,
      allUsers: [...prev.allUsers, user],
      totalOnline: prev.totalOnline + 1,
    }))
  }

  /**
   * Updates the current user's session data
   * Synchronizes changes across the users list
   */
  const updateUserSession = (updatedUser: Session) => {
    setAppState(prev => ({
      ...prev,
      currentUser: updatedUser,
      allUsers: prev.allUsers.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      ),
    }))
  }

  return {
    appState,
    switchToStudyRoom,
    updateUserSession,
  }
}
