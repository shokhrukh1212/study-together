import { useState } from 'react'

interface AdminAuthProps {
  onAuth: (isAuthenticated: boolean) => void
}

/**
 * Simple admin authentication component
 * Uses environment variable for admin password
 */
export const AdminAuth = ({ onAuth }: AdminAuthProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Simple password check - in production, use proper authentication
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin-authenticated', 'true')
      onAuth(true)
    } else {
      setError('Invalid admin password')
      setPassword('')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-text mb-2">
            Admin Access
          </h1>
          <p className="text-primary-text/70">
            Enter admin password to access analytics dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-primary-text/70 mb-2"
            >
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-14 rounded-xl border-none bg-slate-700 p-4 text-base text-primary-text placeholder:text-primary-text/50 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter admin password"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || isLoading}
            className="w-full h-14 bg-accent text-slate-900 font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-primary-text/60 hover:text-primary-text/80 text-sm transition-colors duration-200"
          >
            ← Back to StudyTogether
          </a>
        </div>
      </div>
    </div>
  )
}
