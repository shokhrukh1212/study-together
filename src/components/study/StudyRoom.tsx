import type { StudyRoomProps } from '@/types/types'
import { UserList } from './UserList'

/**
 * StudyRoom component implementing the blueprint states:
 * State 2: Main Room (after joining) - shows Start Study Session button
 * State 3: In Session - shows End Session button and active timer
 */
export const StudyRoom = ({
  currentUser,
  allUsers,
  onStartSession,
  onEndSession,
}: StudyRoomProps) => {
  const isInSession =
    currentUser.status === 'active' && currentUser.sessionStartTime !== null
  const totalStudying = allUsers.filter(
    user => user.status === 'active' && user.sessionStartTime !== null
  ).length

  /**
   * Handles going back to lobby (leave room)
   * For now just reloads the page - in real app would update state
   */
  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave the study room?')) {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Main Header */}
        <h1 className="text-5xl md:text-6xl font-bold text-primary-text mb-6">
          Focus Together, Silently.
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-primary-text/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join a live, global study session and find your focus in a supportive,
          distraction-free environment.
        </p>

        {/* Online Counter */}
        <div className="mb-12">
          <div className="text-6xl font-bold text-accent mb-2">
            {totalStudying}
          </div>
          <div className="text-primary-text/80 text-lg">
            {totalStudying === 1 ? 'person is' : 'people are'} studying right
            now
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-16">
          {!isInSession ? (
            // State 2: Main Room - Start Study Session button
            <button
              onClick={onStartSession}
              className="w-full max-w-lg mx-auto block bg-accent text-primary-bg py-4 px-8 rounded-xl font-semibold text-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary-bg transition-all duration-200"
            >
              ▶ Start Study Session
            </button>
          ) : (
            // State 3: In Session - End Session button
            <button
              onClick={onEndSession}
              className="w-full max-w-lg mx-auto block bg-red-500 text-primary-text py-4 px-8 rounded-xl font-semibold text-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-primary-bg transition-all duration-200"
            >
              ■ End Session
            </button>
          )}

          {/* Leave Room button - shown in both states but less prominent when in session */}
          <button
            onClick={handleLeaveRoom}
            className={`w-full max-w-lg mx-auto block py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              isInSession
                ? 'text-primary-text/40 hover:text-primary-text/60 hover:bg-primary-bg/50'
                : 'text-primary-text/60 hover:text-primary-text/80 hover:bg-primary-bg/50 border border-primary-text/20'
            }`}
          >
            ← Leave Room
          </button>
        </div>

        {/* User List */}
        <div className="space-y-6">
          <UserList
            allUsers={allUsers}
            currentUser={currentUser}
            isLobbyView={false}
          />

          {/* Motivational message when no one is studying */}
          {totalStudying === 0 && (
            <div className="text-primary-text/60">
              <div className="text-4xl mb-4">📖</div>
              <p className="text-lg italic">
                Be the first one here! Start a session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
