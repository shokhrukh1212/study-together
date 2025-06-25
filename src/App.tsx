import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { StudyApp } from '@/components/StudyApp'
import { AdminPage } from '@/components/admin/AdminPage'

/**
 * Main application component with routing
 * Handles navigation between study app and admin dashboard
 */
export const App = () => {
  return (
    <Router>
      <Routes>
        {/* Main study application */}
        <Route path="/" element={<StudyApp />} />

        {/* Admin analytics dashboard */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Fallback route */}
        <Route path="*" element={<StudyApp />} />
      </Routes>
    </Router>
  )
}
