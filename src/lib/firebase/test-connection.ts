import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

/**
 * Test Firebase connection by attempting to read from sessions collection
 * Only used in development mode for debugging
 */
export const testFirebaseConnection = async (): Promise<void> => {
  try {
    console.log('🔥 Testing Firebase connection...')
    const sessionsRef = collection(db, 'sessions')
    await getDocs(sessionsRef)
    console.log('✅ Firebase connection successful')
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
  }
}
