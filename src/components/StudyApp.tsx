import { Lobby } from '@/components/study/Lobby'
import { FeedbackModal } from '@/components/study/FeedbackModal'
import { useFirebaseSession } from '@/hooks/useFirebaseSession'
import { useMockSession } from '@/hooks/useMockSession'
import { collection } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useMemo, memo } from 'react'

// Toggle between Firebase and Mock mode for development
const USE_MOCK_MODE = false // New Firebase project ready - testing real-time functionality

/**
 * Main study application component
 * Handles the core study room functionality
 */
const StudyAppComponent = () => {
  // Create sessions collection reference once with useMemo
  const sessionsRef = useMemo(() => collection(db, 'sessions'), [])

  // Session management - Firebase or Mock mode
  const firebaseSession = useFirebaseSession(sessionsRef)
  const mockSession = useMockSession()

  const {
    currentUser,
    allUsers,
    totalOnline,
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
  } = USE_MOCK_MODE ? mockSession : firebaseSession

  // Show error state if Firebase connection fails
  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-text mb-4">
            Connection Error
          </h1>
          <p className="text-primary-text/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-accent/90"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Show loading state while connecting to Firebase
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary-text/70">Connecting to study room...</p>
        </div>
      </div>
    )
  }

  // Render main app with session data
  return (
    <>
      {USE_MOCK_MODE && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-medium z-50">
          🎭 Mock Mode
        </div>
      )}
      <Lobby
        onJoin={joinRoom}
        totalOnline={totalOnline}
        currentUser={currentUser}
        allUsers={allUsers}
        onStartSession={startSession}
        onEndSession={endSession}
        onLeaveRoom={leaveRoom}
        isJoining={isJoining}
        isLeaving={isLeaving}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        sessionDuration={sessionDuration}
        onClose={closeFeedbackModal}
      />
    </>
  )
}

export const StudyApp = memo(StudyAppComponent)
