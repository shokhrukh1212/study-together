import type { Session } from '@/types/types'
import { Timer } from './Timer'

interface UserListProps {
  allUsers: Session[]
  currentUser: Session | null
  isLobbyView?: boolean
}

/**
 * UserList component that displays all active users with their study timers
 * Shows different styling for the current user vs other users
 */
export const UserList = ({
  allUsers,
  currentUser,
  isLobbyView = false,
}: UserListProps) => {
  if (allUsers.length === 0 && !isLobbyView) {
    return null
  }

  // Mock data for lobby view when showing examples - with simulated study times
  const displayUsers = isLobbyView
    ? [
        {
          id: '1',
          name: 'Alice Wonderland',
          status: 'active' as const,
          sessionStartTime: null,
          lastSeen: new Date(),
          mockTime: '01:12:45',
        },
        {
          id: '2',
          name: 'Bob The Builder',
          status: 'active' as const,
          sessionStartTime: null,
          lastSeen: new Date(),
          mockTime: '00:47:19',
        },
        {
          id: '3',
          name: 'Charlie Brown',
          status: 'active' as const,
          sessionStartTime: null,
          lastSeen: new Date(),
          mockTime: '02:03:55',
        },
        {
          id: '4',
          name: 'Diana Prince',
          status: 'active' as const,
          sessionStartTime: null,
          lastSeen: new Date(),
          mockTime: '00:15:02',
        },
      ]
    : allUsers

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {displayUsers.map(user => {
        const isCurrentUser = currentUser?.id === user.id
        const isStudying =
          user.status === 'active' && user.sessionStartTime !== null

        return (
          <div
            key={user.id}
            className={`flex items-center justify-between px-6 py-4 rounded-lg border ${
              isCurrentUser
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-primary-bg/50 border-primary-text/20 text-primary-text/80'
            }`}
          >
            {/* User Name */}
            <div className="flex items-center space-x-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  isStudying ? 'bg-green-400' : 'bg-primary-text/40'
                }`}
              />
              <span className="font-medium text-lg">
                {user.name}
                {isCurrentUser && ' (You)'}
              </span>
            </div>

            {/* Timer */}
            <div className="text-right">
              {isStudying ? (
                <Timer
                  startTime={user.sessionStartTime}
                  isActive={true}
                  className={
                    isCurrentUser ? 'text-accent' : 'text-primary-text/80'
                  }
                />
              ) : (
                <span className="text-primary-text/60 font-mono text-lg">
                  {isLobbyView && 'mockTime' in user 
                    ? (user as { mockTime: string }).mockTime 
                    : '--:--:--'}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
