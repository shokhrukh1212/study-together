import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
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

/**
 * Cleanup old session history records (older than specified days)
 * This helps manage storage costs while preserving recent analytics data
 */
export const cleanupOldSessionHistory = async (retentionDays: number = 90) => {
  try {
    console.log(
      `Starting cleanup of session history older than ${retentionDays} days...`
    )

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    const cutoffTimestamp = Timestamp.fromDate(cutoffDate)

    const sessionHistoryRef = collection(db, 'session_history')
    const oldSessionsQuery = query(
      sessionHistoryRef,
      where('leftAt', '<', cutoffTimestamp)
    )

    const snapshot = await getDocs(oldSessionsQuery)

    if (snapshot.size === 0) {
      console.log('✅ No old session history to clean up')
      return { success: true, deletedCount: 0 }
    }

    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(db, 'session_history', docSnap.id))
    )

    await Promise.all(deletePromises)
    return { success: true, deletedCount: snapshot.size }
  } catch (error) {
    console.error('❌ Session history cleanup failed:', error)
    return { success: false, error }
  }
}

/**
 * Complete cleanup of all collections (sessions, session_history, feedback)
 * Use this for complete database reset
 */
export const cleanupAllData = async () => {
  try {
    console.log('Starting complete data cleanup...')

    const collections = ['sessions', 'session_history', 'feedback']
    let totalDeleted = 0

    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName)
      const snapshot = await getDocs(collectionRef)

      console.log(`Found ${snapshot.size} documents in ${collectionName}`)

      if (snapshot.size > 0) {
        const deletePromises = snapshot.docs.map(docSnap =>
          deleteDoc(doc(db, collectionName, docSnap.id))
        )

        await Promise.all(deletePromises)
        totalDeleted += snapshot.size
        console.log(
          `✅ Cleaned up ${snapshot.size} documents from ${collectionName}`
        )
      }
    }

    console.log(`✅ Complete cleanup finished. Total deleted: ${totalDeleted}`)
    return { success: true, deletedCount: totalDeleted }
  } catch (error) {
    console.error('❌ Complete cleanup failed:', error)
    return { success: false, error }
  }
}

// Run cleanup if called directly
if (import.meta.url === new URL(import.meta.resolve('./cleanup.ts')).href) {
  cleanupAllSessions()
}
