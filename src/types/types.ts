import { Timestamp } from 'firebase/firestore'

export interface Session {
  id: string // Firestore document ID
  name: string
  status: 'active' | 'idle'
  sessionStartTime: Timestamp | null
  lastSeen: Timestamp
}

export interface SessionHistory {
  id: string // Firestore document ID for the archived session
  originalSessionId: string // Original session ID from sessions collection
  name: string
  sessionStartTime: Timestamp | null
  sessionEndTime: Timestamp
  sessionDuration: number // in seconds, calculated duration
  completedSession: boolean // true if session was properly started and ended
  leftAt: Timestamp // when user left the room
}

export interface CompletedSession {
  id: string // Firestore document ID
  userId: string // Unique identifier for the user (generated once per browser)
  userName: string // Display name of the user
  sessionDuration: number // in seconds, calculated duration
  startTime: Timestamp // when the session started
  endTime: Timestamp // when the session ended
  completedAt: Timestamp // when this record was created
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

// Feedback system types
export type FeedbackRating = 'bad' | 'decent' | 'love'

export interface FeedbackSubmission {
  rating: FeedbackRating
  text: string | null
  sessionDuration: number // in seconds
  timestamp: Timestamp
  userAgent: string
  url: string
}
