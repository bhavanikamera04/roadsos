export interface SensorReading {
  ax: number
  ay: number
  az: number
  speed: number
  timestamp: number
}

export interface CrashScore {
  total: number
  breakdown: {
    gforce: number
    speedDrop: number
    noMovement: number
  }
  isCrash: boolean
}

export function calculateMagnitude(ax: number, ay: number, az: number): number {
  return Math.sqrt(ax * ax + ay * ay + az * az)
}

export function calculateCrashScore(
  readings: SensorReading[],
  currentSpeed: number,
  previousSpeed: number
): CrashScore {

  if (readings.length === 0) {
    return { total: 0, breakdown: { gforce: 0, speedDrop: 0, noMovement: 0 }, isCrash: false }
  }

  // Find peak magnitude in the last 2 seconds of readings
  const magnitudes = readings.map(r => calculateMagnitude(r.ax, r.ay, r.az))
  const peakMagnitude = Math.max(...magnitudes)

  // G-force score (0-4 points)
  let gforceScore = 0
  if (peakMagnitude > 25) gforceScore = 4
  else if (peakMagnitude > 20) gforceScore = 3
  else if (peakMagnitude > 15) gforceScore = 2
  else if (peakMagnitude > 12) gforceScore = 1

  // Speed drop score (0-3 points)
  const speedDrop = previousSpeed - currentSpeed
  let speedScore = 0
  if (speedDrop > 30) speedScore = 3
  else if (speedDrop > 15) speedScore = 2
  else if (speedDrop > 8) speedScore = 1

  // No movement score (0-2 points)
  const recentMagnitudes = magnitudes.slice(-10)
  const avgRecent = recentMagnitudes.reduce((a, b) => a + b, 0) / recentMagnitudes.length
  const noMovementScore = avgRecent < 10.5 ? 2 : 0

  const total = gforceScore + speedScore + noMovementScore
  // Require speed evidence for auto-trigger
  // If phone was never moving, require higher threshold
  const wasMoving = previousSpeed > 8
  const isCrash = wasMoving ? total >= 5 : total >= 8

  return {
    total,
    breakdown: { gforce: gforceScore, speedDrop: speedScore, noMovement: noMovementScore },
    isCrash
  }
}