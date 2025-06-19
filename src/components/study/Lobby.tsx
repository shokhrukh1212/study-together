import { useState } from 'react'
import type { LobbyProps } from '@/types/types'
import { UserList } from './UserList'

/**
 * Lobby component matching the dark theme design
 * Shows the main landing page with join functionality and active users
 */
export const Lobby = ({ onJoin, totalOnline }: LobbyProps) => {
  const [name, setName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  /**
   * Handles form submission to join the study room
   * Validates name input and triggers join flow
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setIsJoining(true)
    try {
      await onJoin(name.trim())
    } catch (error) {
      console.error('Failed to join room:', error)
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center space-y-12">
        {/* Main Header */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-text">
            Focus Together, Silently.
          </h1>
          
          <p className="text-xl text-primary-text/70 max-w-2xl mx-auto leading-relaxed">
            Join a live, global study session and find your focus in a supportive,
            distraction-free environment.
          </p>
        </div>

        {/* Online Counter - Much larger and more prominent */}
        <div className="space-y-3">
          <div className="text-8xl md:text-9xl font-bold text-accent leading-none">
            {totalOnline}
          </div>
          <div className="text-lg text-primary-text/70">
            {totalOnline === 1 ? 'person is' : 'people are'} studying right now
          </div>
        </div>

        {/* Join Form - Larger and more prominent */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-8 py-6 bg-slate-800 border border-slate-600 rounded-2xl text-primary-text placeholder-slate-400 text-xl focus:outline-none focus:ring-3 focus:ring-accent focus:border-accent transition-all duration-200"
            disabled={isJoining}
            maxLength={50}
            required
          />

          <button
            type="submit"
            disabled={!name.trim() || isJoining}
            className="w-full bg-accent text-primary-bg py-6 px-8 rounded-2xl font-bold text-xl hover:bg-accent/90 focus:outline-none focus:ring-3 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary-bg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isJoining ? 'Joining...' : 'Join the Study Room'}
          </button>
        </form>

        {/* User List - Always show in lobby view to match original design */}
        <div className="pt-8">
          <UserList allUsers={[]} currentUser={null} isLobbyView={true} />
          
          {/* Book Icon and Message - Show below user list */}
          <div className="text-primary-text/50 mt-8">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-lg italic">
              Be the first one here! Start a session.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
