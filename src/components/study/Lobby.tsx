import { useState, useEffect, useCallback, useMemo } from 'react'
import type { LobbyProps, Session } from '@/types/types'
import { UserList } from './UserList'

interface ExtendedLobbyProps extends LobbyProps {
  currentUser?: Session | null
  allUsers?: Session[]
  onStartSession?: () => void
  onEndSession?: () => void
  onLeaveRoom?: () => void
  isJoining?: boolean
  isLeaving?: boolean
}

/**
 * Unified component handling both lobby and study room states
 * Maintains the same layout and only changes buttons/content
 */
export const Lobby = ({
  onJoin,
  totalOnline,
  currentUser = null,
  allUsers = [],
  onStartSession,
  onEndSession,
  onLeaveRoom,
  isJoining = false,
  isLeaving = false,
}: ExtendedLobbyProps) => {
  const [name, setName] = useState('')
  const [isStartingSession, setIsStartingSession] = useState(false)

  // Add this useEffect after the existing one
  useEffect(() => {
    // Reset starting state when session actually begins
    if (
      currentUser?.status === 'active' &&
      currentUser.sessionStartTime &&
      isStartingSession
    ) {
      setIsStartingSession(false)
    }
  }, [currentUser?.status, currentUser?.sessionStartTime, isStartingSession])

  // Reset joining state when user successfully joins or leaves
  // useEffect(() => {
  //   if (currentUser && isJoining) {
  //     setIsJoining(false)
  //   }
  //   if (!currentUser && isJoining) {
  //     setIsJoining(false)
  //     setName('') // Clear name for next user
  //   }
  // }, [currentUser, isJoining])

  /**
   * Handles form submission to join the study room
   * Validates name input and triggers join flow
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!name.trim()) return

      try {
        await onJoin(name.trim())
      } catch (error) {
        console.error('Failed to join room:', error)
      }
    },
    [name, onJoin]
  )

  /**
   * Handles starting a session with loading state
   */
  const handleStartSession = useCallback(async () => {
    if (!onStartSession) return

    setIsStartingSession(true)
    try {
      await onStartSession()
    } catch (error) {
      console.error('Failed to start session:', error)
      setIsStartingSession(false)
    }
  }, [onStartSession])

  /**
   * Gets the appropriate message based on user state and total online count
   */
  const getCounterMessage = useMemo((): string => {
    // If user is joining, show joining message
    if (isJoining) {
      return 'Joining the study session...'
    }

    // If user is leaving, show leaving message
    if (isLeaving) {
      return 'Leaving the room...'
    }

    // If user hasn't joined yet (lobby view)
    if (!currentUser) {
      if (totalOnline === 0) {
        return 'Perfect timing! Start your focused session and others will join you.'
      } else if (totalOnline === 1) {
        return 'Someone is deep in focus. Join the session!'
      } else {
        return 'People in silent focus - find your zone'
      }
    } else {
      // Study room view - user has joined, show study room messages
      if (totalOnline === 1) {
        return "You're leading today's study session. Stay focused!"
      } else {
        return "You're in great company - time to focus together!"
      }
    }
  }, [isJoining, isLeaving, currentUser, totalOnline])

  /**
   * Determines whether to show the number based on user state
   */
  const shouldShowNumber = useMemo((): boolean => {
    // Don't show number while joining
    if (isJoining || isLeaving) return false

    // Use the SAME logic as buttons: if no currentUser, use lobby logic
    if (!currentUser) {
      // Lobby view
      return totalOnline > 0
    } else {
      // Study room view
      return totalOnline > 1
    }
  }, [isJoining, isLeaving, currentUser, totalOnline])

  return (
    <>
      {/* Full page spinner for joining/leaving states */}
      {(isJoining || isLeaving) && (
        <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-primary-text/70">
              {isJoining ? 'Joining the study room...' : 'Leaving the room...'}
            </p>
          </div>
        </div>
      )}
      {!isJoining && !isLeaving && (
        <div className="min-h-screen bg-primary-bg flex flex-col items-center justify-center p-4">
          <div className="flex w-full max-w-[700px] flex-col items-center text-center">
            {/* Main Header */}
            <h1 className="mb-4 text-5xl font-bold text-primary-text leading-tight md:text-6xl">
              Focus <span className="text-accent font-extrabold">Together</span>
              , Silently.
            </h1>

            <p className="mb-8 text-lg text-primary-text opacity-80 md:text-xl">
              Join a <span className="text-accent font-semibold">live</span>,
              global study session and find your{' '}
              <span className="text-accent font-semibold">focus</span> in a
              supportive,
              <span className="text-accent font-semibold">
                {' '}
                distraction-free
              </span>{' '}
              environment.
            </p>

            {/* Online Counter */}
            {/* Online Counter */}
            <div className="mb-10 w-full flex flex-col items-center text-center">
              {/* Show spinner while joining or leaving */}
              {isJoining || isLeaving ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
                  <p className="text-xl md:text-2xl text-primary-text/70">
                    {isJoining
                      ? 'Joining the study session...'
                      : 'Leaving the room...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Number - Large and prominent (conditionally shown) */}
                  {shouldShowNumber && (
                    <div className="text-8xl font-bold text-accent mb-3 leading-none">
                      {totalOnline}
                    </div>
                  )}

                  {/* Dynamic message based on user state and count */}
                  <p
                    className={`text-xl md:text-2xl text-primary-text w-full leading-relaxed italic font-light ${!shouldShowNumber ? 'mt-6' : ''}`}
                  >
                    {getCounterMessage}
                  </p>
                </>
              )}
            </div>

            {/* Action Area - Changes based on user state */}
            <div className="w-full">
              {!currentUser ? (
                // State 1: Lobby - Show input and join button
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="mb-6 w-full">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-14 w-full rounded-xl border-none bg-slate-800 p-4 text-base text-primary-text placeholder:text-primary-text/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      disabled={isJoining}
                      maxLength={50}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!name.trim() || isJoining}
                    className="mb-8 h-14 w-full cursor-pointer rounded-xl bg-accent px-8 text-lg font-bold text-slate-900 transition-all duration-150 ease-in-out hover:bg-accent/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoining ? 'Joining...' : 'Join the Study Room'}
                  </button>
                </form>
              ) : (
                // State 2 & 3: Joined - Show session control buttons
                <div className="space-y-3 mb-8">
                  {currentUser.status === 'idle' ||
                  !currentUser.sessionStartTime ? (
                    // State 2: Start Study Session
                    <button
                      onClick={handleStartSession}
                      disabled={isStartingSession}
                      className="h-14 w-full cursor-pointer rounded-xl bg-accent px-8 text-lg font-bold text-slate-900 transition-all duration-150 ease-in-out hover:bg-accent/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStartingSession
                        ? '▶ Starting session...'
                        : '▶ Start Study Session'}
                    </button>
                  ) : (
                    // State 3: End Session
                    <button
                      onClick={onEndSession}
                      className="h-14 w-full cursor-pointer rounded-xl bg-red-500 px-8 text-lg font-bold text-white transition-all duration-150 ease-in-out hover:bg-red-600 focus:outline-none"
                    >
                      ■ End Session
                    </button>
                  )}

                  {/* Leave Room button */}
                  <button
                    onClick={onLeaveRoom}
                    disabled={
                      currentUser.status === 'active' &&
                      currentUser.sessionStartTime !== null
                    }
                    className={`h-14 w-full cursor-pointer rounded-xl border-2 border-primary-text/20 bg-transparent px-8 text-lg font-bold transition-all duration-150 ease-in-out focus:outline-none ${
                      currentUser.status === 'active' &&
                      currentUser.sessionStartTime !== null
                        ? 'text-primary-text/30 cursor-not-allowed opacity-50'
                        : 'text-primary-text/60 hover:bg-primary-text/5 hover:text-primary-text/80'
                    }`}
                  >
                    ← Leave Room
                  </button>
                </div>
              )}
            </div>

            {/* Separator line */}
            <hr className="mb-8 w-full border-t border-primary-text/10" />

            {/* Conditional Content - User List OR Book Icon */}
            <div className="w-full">
              {totalOnline > 0 ? (
                <UserList
                  allUsers={allUsers}
                  currentUser={currentUser}
                  isLobbyView={!currentUser}
                />
              ) : (
                <div className="text-primary-text/50 text-center">
                  <div className="text-5xl mb-4">📖</div>
                  <p className="text-lg italic">
                    Be the first one here! Start a session.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
