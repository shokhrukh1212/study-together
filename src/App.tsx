import { Lobby } from '@/components/study/Lobby'
import { useAppState } from '@/hooks/useAppState'
import { useSessionHandlers } from '@/hooks/useSessionHandlers'
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection'

/**
 * Main application component
 * Uses unified Lobby component for all states
 */
export const App = () => {
  // Initialize Firebase connection (dev only)
  useFirebaseConnection()

  // Manage app state and view transitions
  const { appState, switchToStudyRoom, updateUserSession } = useAppState()

  // Handle all session-related actions
  const { handleJoinRoom, handleStartSession, handleEndSession } =
    useSessionHandlers({
      currentUser: appState.currentUser,
      onUserUpdate: updateUserSession,
      onUserJoin: switchToStudyRoom,
    })

  // Handle leaving the room
  const handleLeaveRoom = () => {
    window.location.reload()
  }

  // Render unified component for all states
  return (
    <Lobby
      onJoin={handleJoinRoom}
      totalOnline={appState.totalOnline}
      currentUser={appState.currentUser}
      allUsers={appState.allUsers}
      onStartSession={handleStartSession}
      onEndSession={handleEndSession}
      onLeaveRoom={handleLeaveRoom}
    />
  )
}
