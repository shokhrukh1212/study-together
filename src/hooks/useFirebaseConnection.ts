import { useEffect } from 'react'
import { testFirebaseConnection } from '@/lib/firebase/test-connection'

/**
 * Custom hook to initialize Firebase connection on app startup
 * Only runs in development mode to avoid unnecessary testing in production
 */
export const useFirebaseConnection = () => {
  useEffect(() => {
    // Only test Firebase connection in development environment
    if (import.meta.env.DEV) {
      testFirebaseConnection()
    }
  }, [])
}
