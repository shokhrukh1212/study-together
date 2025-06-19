import { Lobby } from '@/components/study/Lobby'
import { StudyRoom } from '@/components/study/StudyRoom'
import { useAppState } from '@/hooks/useAppState'
import { useSessionHandlers } from '@/hooks/useSessionHandlers'
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection'

/**
 * Main application component
 * Orchestrates the lobby and study room views
 * Manages user session flow and state transitions
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

  // Render lobby view
  if (appState.view === 'lobby') {
    return <Lobby onJoin={handleJoinRoom} totalOnline={appState.totalOnline} />
  }

  // Render study room view
  if (appState.view === 'study-room' && appState.currentUser) {
    return (
      <StudyRoom
        currentUser={appState.currentUser}
        allUsers={appState.allUsers}
        onStartSession={handleStartSession}
        onEndSession={handleEndSession}
      />
    )
  }

  // Fallback loading state
  return <div className="min-h-screen bg-gray-50">Loading...</div>
}
