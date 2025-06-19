import { useState } from 'react'
import type { AppState, Session } from '@/types/types'

/**
 * Custom hook to manage the main application state
 * Handles view transitions between lobby and study room
 * Manages user sessions and online count
 */
export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>({
    view: 'lobby',
    currentUser: null,
    allUsers: [],
    totalOnline: 4, // Mock count to match lobby user list
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
