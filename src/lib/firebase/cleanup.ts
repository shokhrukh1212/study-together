import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Cleanup script to remove all sessions from Firestore
 * Use this to clear test data and reset quota usage
 */
export const cleanupAllSessions = async () => {
  try {
    console.log('Starting cleanup of all sessions...')

    const sessionsRef = collection(db, 'sessions')
    const snapshot = await getDocs(sessionsRef)

    console.log(`Found ${snapshot.size} sessions to delete`)

    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(db, 'sessions', docSnap.id))
    )

    await Promise.all(deletePromises)

    console.log('✅ All sessions cleaned up successfully')
    return { success: true, deletedCount: snapshot.size }
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    return { success: false, error }
  }
}

// Run cleanup if called directly
if (import.meta.url === new URL(import.meta.resolve('./cleanup.ts'))) {
  cleanupAllSessions()
}
