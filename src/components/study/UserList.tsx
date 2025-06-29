import { useMemo, memo } from 'react'
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
const UserListComponent = ({
  allUsers,
  currentUser,
  isLobbyView = false,
}: UserListProps) => {
  // Use real users for both lobby and study room views
  // Only include currentUser if it exists and is not null
  const displayUsers = useMemo(() => {
    return currentUser && currentUser.id
      ? [currentUser, ...allUsers.filter(u => u.id !== currentUser.id)]
      : allUsers
  }, [allUsers, currentUser])

  // Show user list if: lobby view OR current user exists (even if alone)
  if (allUsers.length === 0 && !isLobbyView && !currentUser) {
    return null
  }

  return (
    <div className="space-y-2 w-full max-h-80 overflow-y-auto">
      {displayUsers.map(user => {
        const isCurrentUser = currentUser?.id === user.id
        const isStudying =
          user.status === 'active' && user.sessionStartTime !== null

        return (
          <div
            key={user.id}
            className={`w-full flex items-center justify-between p-3 ${
              isCurrentUser ? 'text-accent' : 'text-primary-text'
            }`}
          >
            {/* User Name */}
            <span
              className={`text-left ${isCurrentUser ? 'font-semibold text-accent' : ''}`}
            >
              {user.name}
              {isCurrentUser && ' (You)'}
            </span>

            {/* Dotted line connector */}
            <div
              className="flex-grow border-b border-dotted border-primary-text/20 mx-2 h-0"
              style={{ alignSelf: 'center' }}
            />

            {/* Timer */}
            <span
              className={`font-mono text-right ${isCurrentUser ? 'text-accent' : 'text-primary-text'}`}
            >
              {isStudying ? (
                <Timer
                  startTime={user.sessionStartTime}
                  isActive={true}
                  className={
                    isCurrentUser ? 'text-accent' : 'text-primary-text'
                  }
                />
              ) : (
                '--:--:--'
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const UserList = memo(UserListComponent)
