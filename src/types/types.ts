import { Timestamp } from 'firebase/firestore'

export interface Session {
  id: string // Firestore document ID
  name: string
  status: 'active' | 'idle'
  sessionStartTime: Timestamp | null
  lastSeen: Timestamp
}

export interface AppState {
  view: 'lobby' | 'study-room'
  currentUser: Session | null
  allUsers: Session[]
  totalOnline: number
}

// Component props interfaces
export interface LobbyProps {
  onJoin: (name: string) => void
  totalOnline: number
}

export interface StudyRoomProps {
  currentUser: Session
  allUsers: Session[]
  onStartSession: () => void
  onEndSession: () => void
}
