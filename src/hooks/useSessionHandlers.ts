import type { Session } from '@/types/types'
import {
  createUserSession,
  startUserSession,
  endUserSession,
} from '@/utils/sessionUtils'

interface UseSessionHandlersProps {
  currentUser: Session | null
  onUserUpdate: (user: Session) => void
  onUserJoin: (user: Session) => void
}

/**
 * Custom hook to handle all user session actions
 * Manages joining, starting, and ending study sessions
 * Integrates with session utility functions for business logic
 */
export const useSessionHandlers = ({
  currentUser,
  onUserUpdate,
  onUserJoin,
}: UseSessionHandlersProps) => {
  /**
   * Handles user joining the study room from lobby
   * Creates new session and triggers view transition
   */
  const handleJoinRoom = (name: string) => {
    const newUser = createUserSession(name)
    onUserJoin(newUser)
  }

  /**
   * Handles starting a study session
   * Updates user status to active and sets start time
   */
  const handleStartSession = () => {
    if (!currentUser) return
    const updatedUser = startUserSession(currentUser)
    onUserUpdate(updatedUser)
  }

  /**
   * Handles ending a study session
   * Updates user status to idle and clears start time
   */
  const handleEndSession = () => {
    if (!currentUser) return
    const updatedUser = endUserSession(currentUser)
    onUserUpdate(updatedUser)
  }

  return {
    handleJoinRoom,
    handleStartSession,
    handleEndSession,
  }
}
