import { db } from '@/lib/firebase/firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('🔄 Testing Firebase connection...')
    console.log('📊 Database instance:', db.app.name)

    // Test writing to Firestore with sessions collection (as per our rules)
    const testDoc = await addDoc(collection(db, 'sessions'), {
      name: 'Firebase Test User',
      status: 'active',
      sessionStartTime: new Date(),
      lastSeen: new Date(),
    })

    console.log('✅ Firebase write successful:', testDoc.id)

    // Test reading from Firestore
    const querySnapshot = await getDocs(collection(db, 'sessions'))
    console.log('✅ Firebase read successful:', querySnapshot.size, 'documents')

    return true
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return false
  }
}
