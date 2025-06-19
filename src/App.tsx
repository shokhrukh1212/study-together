import { useEffect } from 'react'
import { testFirebaseConnection } from '@/lib/firebase/test-connection'

export const App = () => {
  useEffect(() => {
    // Test Firebase connection on app load
    testFirebaseConnection()
  }, [])

  return <div className="min-h-screen bg-gray-50">Study Together</div>
}
