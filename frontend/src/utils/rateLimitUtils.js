// Rate Limit Reset Utility for Development
// This helps developers reset rate limits during development

const resetRateLimit = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/reset-rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      console.log('Rate limit reset successfully')
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to reset rate limit:', error)
    return false
  }
}

// Auto-reset rate limit in development
if (import.meta.env.DEV) {
  // Reset rate limit every 5 minutes in development
  setInterval(() => {
    resetRateLimit()
  }, 5 * 60 * 1000) // 5 minutes
}

export { resetRateLimit }
