import { useState, useEffect } from 'react'
import { Timestamp } from 'firebase/firestore'

interface TimerProps {
  startTime: Timestamp | null
  isActive: boolean
  className?: string
}

/**
 * Timer component that displays elapsed time since session start
 * Updates every second when active, calculates from Firebase Timestamp
 */
export const Timer = ({ startTime, isActive, className = '' }: TimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  /**
   * Calculate elapsed time from Firebase Timestamp
   * Returns seconds since the start time
   */
  const calculateElapsedTime = (start: Timestamp): number => {
    if (!start) return 0

    const elapsed = Math.floor((Date.now() - start.toMillis()) / 1000)

    // Guard against negative time (server/client clock differences)
    return Math.max(0, elapsed)
  }

  /**
   * Format seconds into MM:SS or HH:MM:SS format
   * Shows hours only when >= 1 hour
   */
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Update timer every second when active
  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsedSeconds(0)
      return
    }

    // Initial calculation
    setElapsedSeconds(calculateElapsedTime(startTime))

    // Set up interval for updates
    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsedTime(startTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isActive])

  // Handle tab visibility changes - recalculate when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isActive && startTime) {
        setElapsedSeconds(calculateElapsedTime(startTime))
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [startTime, isActive])

  if (!isActive || !startTime) {
    return <span className={`font-mono text-lg ${className}`}>--:--</span>
  }

  return (
    <span className={`font-mono text-lg ${className}`}>
      {formatTime(elapsedSeconds)}
    </span>
  )
}
