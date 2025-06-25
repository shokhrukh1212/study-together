import { useState, useEffect } from 'react'
import { AdminAuth } from './AdminAuth'
import { StatsDashboard } from '@/components/analytics/StatsDashboard'

/**
 * Admin page that handles authentication and displays analytics dashboard
 * Protects the analytics dashboard behind a simple password
 */
export const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem('admin-authenticated') === 'true'
    setIsAuthenticated(isAuth)
    setIsCheckingAuth(false)
  }, [])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated')
    setIsAuthenticated(false)
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary-text/70">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuth={setIsAuthenticated} />
  }

  // Show dashboard if authenticated
  return (
    <div className="relative">
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 bg-slate-700 text-primary-text px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-600 transition-all duration-200"
      >
        Logout
      </button>

      {/* Analytics Dashboard */}
      <StatsDashboard autoRefresh={true} refreshInterval={60000} />
    </div>
  )
}
