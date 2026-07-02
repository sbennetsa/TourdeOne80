/**
 * M1: Time parsing
 * Parse h:mm:ss, mm:ss, decimal minutes → seconds
 *
 * Valid formats:
 *   "1:08:30" → 3900 + 510 = 4410 seconds
 *   "52:10"   → 3130 seconds
 *   52.5      → 3150 seconds
 *
 * Invalid/empty → undefined (not a completion)
 */

export function parseTime(cell: any): number | undefined {
  // Empty cell → not ridden
  if (cell === null || cell === undefined || cell === "") {
    return undefined
  }

  const raw = String(cell).trim()

  // Try numeric (decimal minutes)
  if (!isNaN(Number(raw))) {
    const minutes = parseFloat(raw)
    if (isNaN(minutes) || minutes < 0) return undefined
    return Math.round(minutes * 60)
  }

  // Try h:mm:ss or mm:ss format
  const parts = raw.split(":").map(p => parseInt(p, 10))

  if (parts.length === 2) {
    const [mm, ss] = parts
    if (isNaN(mm) || isNaN(ss) || mm < 0 || ss < 0 || ss >= 60) return undefined
    return mm * 60 + ss
  }

  if (parts.length === 3) {
    const [hh, mm, ss] = parts
    if (isNaN(hh) || isNaN(mm) || isNaN(ss) || hh < 0 || mm < 0 || mm >= 60 || ss < 0 || ss >= 60) {
      return undefined
    }
    return hh * 3600 + mm * 60 + ss
  }

  // Unrecognized format
  return undefined
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`
}

export function formatGap(seconds: number): string {
  if (seconds <= 0) return "—"
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `+${minutes}:${String(secs).padStart(2, "0")}`
}
