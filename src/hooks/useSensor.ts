import { useState, useRef, useCallback } from 'react'
import { calculateCrashScore } from '../utils/detection'
import type { SensorReading, CrashScore } from '../utils/detection'

export function useSensor() {
  const [crashScore, setCrashScore] = useState<CrashScore>({
    total: 0,
    breakdown: { gforce: 0, speedDrop: 0, noMovement: 0 },
    isCrash: false
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const bufferRef = useRef<SensorReading[]>([])
  const speedRef = useRef<number>(0)
  const prevSpeedRef = useRef<number>(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const triggerCountdown = useCallback(() => {
    if (countdownRef.current) return
    setCountdown(10)

    let count = 10
    countdownRef.current = setInterval(() => {
      count -= 1
      setCountdown(count)

      if (count <= 0) {
        clearInterval(countdownRef.current!)
        countdownRef.current = null
        setCountdown(null)
        window.dispatchEvent(new CustomEvent('roadsos:emergency'))
      }
    }, 1000)
  }, [])

  const cancelCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setCountdown(null)
  }, [])

  const startSimulation = useCallback(() => {
    let phase = 0

    const interval = setInterval(() => {
      phase += 1

      let reading: SensorReading

      if (phase < 20) {
        // Normal driving at 60 km/h
        reading = {
          ax: (Math.random() - 0.5) * 2,
          ay: (Math.random() - 0.5) * 2,
          az: 9.8 + (Math.random() - 0.5),
          speed: 60 + Math.random() * 5,
          timestamp: Date.now()
        }
        prevSpeedRef.current = 60
        speedRef.current = 60
      } else if (phase < 25) {
        // Crash impact — spike
        reading = {
          ax: (Math.random() - 0.5) * 30,
          ay: (Math.random() - 0.5) * 30,
          az: 25 + Math.random() * 20,
          speed: 10,
          timestamp: Date.now()
        }
        prevSpeedRef.current = 60
        speedRef.current = 10
      } else {
        // After crash — stationary
        reading = {
          ax: (Math.random() - 0.5) * 0.5,
          ay: (Math.random() - 0.5) * 0.5,
          az: 9.8 + (Math.random() - 0.5) * 0.3,
          speed: 0,
          timestamp: Date.now()
        }
        prevSpeedRef.current = 10
        speedRef.current = 0
      }

      bufferRef.current.push(reading)
      if (bufferRef.current.length > 40) bufferRef.current.shift()

      const score = calculateCrashScore(
        bufferRef.current,
        speedRef.current,
        prevSpeedRef.current
      )

      setCrashScore(score)

      if (score.isCrash && !countdownRef.current) {
        triggerCountdown()
      }

      if (phase > 60) {
        clearInterval(interval)
      }
    }, 100)
  }, [triggerCountdown])

  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true)

    // No motion sensor on laptop — use simulation
    // Force simulation on non-mobile devices
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  if (!isMobile) {
    startSimulation()
    return
}

    // iOS requires explicit permission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') {
          setPermissionDenied(true)
          startSimulation()
          return
        }
      } catch {
        startSimulation()
        return
      }
    }

    // Real GPS speed
    navigator.geolocation.watchPosition((pos) => {
      prevSpeedRef.current = speedRef.current
      speedRef.current = (pos.coords.speed || 0) * 3.6
    })

    // Real accelerometer
    window.addEventListener('devicemotion', (event) => {
      const acc = event.accelerationIncludingGravity
      if (!acc) return

      const reading: SensorReading = {
        ax: acc.x || 0,
        ay: acc.y || 0,
        az: acc.z || 0,
        speed: speedRef.current,
        timestamp: Date.now()
      }

      bufferRef.current.push(reading)
      if (bufferRef.current.length > 40) bufferRef.current.shift()

      const score = calculateCrashScore(
        bufferRef.current,
        speedRef.current,
        prevSpeedRef.current
      )

      setCrashScore(score)

      if (score.isCrash && !countdownRef.current) {
        triggerCountdown()
      }
    })
  }, [triggerCountdown, startSimulation])

  return {
    crashScore,
    isMonitoring,
    countdown,
    permissionDenied,
    startMonitoring,
    cancelCountdown
  }
}