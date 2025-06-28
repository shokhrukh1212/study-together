import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import type { FeedbackRating, FeedbackSubmission } from '@/types/types'

interface FeedbackModalProps {
  isOpen: boolean
  sessionDuration: number // in seconds
  onClose: () => void
}

type RatingType = FeedbackRating | null

/**
 * Feedback modal that appears after user ends their study session
 * Includes rating system and optional text feedback with smooth animations
 */
export const FeedbackModal = ({
  isOpen,
  sessionDuration,
  onClose,
}: FeedbackModalProps) => {
  const [selectedRating, setSelectedRating] = useState<RatingType>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      // Reset modal state when it opens
      setSelectedRating(null)
      setFeedbackText('')
      setIsSubmitted(false)
      setIsSubmitting(false)

      // Start opening animation
      setShouldRender(true)
      setTimeout(() => setIsVisible(true), 10) // Small delay for DOM to render
    } else {
      // Start closing animation
      setIsVisible(false)
      // Remove from DOM after animation completes
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [isOpen])

  // Auto-close modal after thank you message
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        onClose()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted, onClose])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitted) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
      return () => document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, isSubmitted, onClose])

  /**
   * Formats session duration into human-readable text
   */
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
  }

  /**
   * Handles feedback submission to Firebase Firestore
   */
  const handleSubmit = async () => {
    if (!selectedRating) return

    setIsSubmitting(true)

    try {
      // Create feedback document in Firestore
      const feedbackData: Omit<FeedbackSubmission, 'timestamp'> & {
        timestamp: ReturnType<typeof serverTimestamp>
      } = {
        rating: selectedRating,
        text: feedbackText.trim() || null, // Store null if no text provided
        sessionDuration,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent, // For analytics and debugging
        url: window.location.href, // Track which page/version
      }

      // Save to Firebase
      await addDoc(collection(db, 'feedback'), feedbackData)
      setIsSubmitted(true)
    } catch (error) {
      console.error('❌ Failed to submit feedback:', error)

      // Show error state or retry logic could be added here
      // For now, still show success to avoid confusing users
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle click outside to close modal
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitted) {
      onClose()
    }
  }

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 feedback-modal-backdrop transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl feedback-modal-container relative transition-all duration-300 ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{ backgroundColor: 'var(--color-feedback-modal-bg)' }}
      >
        {!isSubmitted ? (
          <>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors duration-200 hover:opacity-70 cursor-pointer"
              style={{ color: 'var(--color-feedback-modal-text)' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--color-feedback-modal-text)' }}
              >
                Rate your experience
              </h2>
              <p
                className="text-base leading-relaxed opacity-80"
                style={{ color: 'var(--color-feedback-modal-text)' }}
              >
                Great! You've focused for {formatDuration(sessionDuration)}. How
                was your experience?
              </p>
            </div>

            {/* Rating Icons */}
            <div className="flex justify-center gap-6 mb-8">
              {/* Bad */}
              <button
                onClick={() => setSelectedRating('bad')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:bg-white/5 hover:scale-105 cursor-pointer ${
                  selectedRating === 'bad' ? 'bg-white/10 scale-105' : ''
                }`}
              >
                <div className="text-5xl">😞</div>
                <span
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color:
                      selectedRating === 'bad'
                        ? 'var(--color-feedback-icon-selected)'
                        : 'var(--color-feedback-icon-default)',
                  }}
                >
                  Bad
                </span>
              </button>

              {/* Decent */}
              <button
                onClick={() => setSelectedRating('decent')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:bg-white/5 hover:scale-105 cursor-pointer ${
                  selectedRating === 'decent' ? 'bg-white/10 scale-105' : ''
                }`}
              >
                <div className="text-5xl">😊</div>
                <span
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color:
                      selectedRating === 'decent'
                        ? 'var(--color-feedback-icon-selected)'
                        : 'var(--color-feedback-icon-default)',
                  }}
                >
                  Decent
                </span>
              </button>

              {/* Love it */}
              <button
                onClick={() => setSelectedRating('love')}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:bg-white/5 hover:scale-105 cursor-pointer ${
                  selectedRating === 'love' ? 'bg-white/10 scale-105' : ''
                }`}
              >
                <div className="text-5xl">🤩</div>
                <span
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color:
                      selectedRating === 'love'
                        ? 'var(--color-feedback-icon-selected)'
                        : 'var(--color-feedback-icon-default)',
                  }}
                >
                  Love it
                </span>
              </button>
            </div>

            {/* Feedback Text Area - Shows after rating selection */}
            {selectedRating && (
              <div className="feedback-textarea-container">
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Tell us more"
                  className="w-full h-24 p-4 border border-white/20 rounded-2xl resize-none focus:outline-none focus:border-accent transition-all duration-200 mb-4"
                  style={{
                    backgroundColor: 'var(--color-feedback-textarea-bg)',
                    color: 'var(--color-feedback-textarea-text)',
                  }}
                  maxLength={500}
                />

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full font-semibold py-4 px-6 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 text-lg cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-feedback-submit-bg)',
                    color: 'var(--color-feedback-submit-text)',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit your feedback'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Thank You Message */
          <div className="text-center feedback-thankyou-container">
            <div className="text-6xl mb-6">🙏</div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--color-feedback-thankyou-text)' }}
            >
              Thank you for your feedback!
            </h2>
            <p
              className="text-base"
              style={{ color: 'var(--color-feedback-thankyou-text)' }}
            >
              Your input helps us improve the experience for everyone.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
