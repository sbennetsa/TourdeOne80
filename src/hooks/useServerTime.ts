import { useState, useEffect } from 'react'

let timeOffset = 0 // milliseconds to add to local time to get server time

/**
 * Get current server time by adding offset to local time
 */
export function getServerTime(): Date {
  return new Date(Date.now() + timeOffset)
}

/**
 * Sync client time with server and calculate offset
 */
export function useServerTime() {
  const [synced, setSynced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const syncTime = async () => {
      try {
        // Fetch current server time from World Time API (SAST timezone)
        const response = await fetch('https://worldtimeapi.org/api/timezone/Africa/Johannesburg')
        if (!response.ok) throw new Error('Failed to fetch server time')

        const data = await response.json()
        const serverTime = new Date(data.datetime).getTime()
        const clientTime = Date.now()

        // Calculate offset: server time - client time
        timeOffset = serverTime - clientTime

        setSynced(true)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Fallback: assume client time is correct
        timeOffset = 0
      }
    }

    // Sync immediately on mount
    syncTime()

    // Re-sync every 5 minutes to account for drift
    const interval = setInterval(syncTime, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { synced, error, getServerTime }
}
