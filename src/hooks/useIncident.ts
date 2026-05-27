import { useState, useEffect, useCallback, useRef } from 'react'
import { IncidentRepository, type Incident, type IncidentStatus } from '../repositories/incidentRepository'
import { useAuth } from './useAuth'

export function useIncident() {
  const { user } = useAuth()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
      heartbeatInterval.current = null
    }
  }, [])

  const startHeartbeat = useCallback((incidentId: string) => {
    stopHeartbeat()
    heartbeatInterval.current = setInterval(async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        await IncidentRepository.sendHeartbeat({
          incident_id: incidentId,
          location: `${pos.coords.longitude} ${pos.coords.latitude}`,
          battery_level: (window as any).navigator.getBattery
            ? await (window as any).navigator.getBattery().then((b: { level: number }) => b.level * 100)
            : 100,
          network_strength: (navigator as any).connection?.effectiveType || 'unknown',
          sensor_confidence: 1.0 // Placeholder
        })
      } catch (err) {
        console.error('Heartbeat failed:', err)
      }
    }, 15000) // 15s Heartbeat as per architecture blueprint
  }, [])

  const triggerIncident = async (severity: number, location: { lat: number, lon: number }) => {
    try {
      const newIncident = await IncidentRepository.createIncident(user?.id || null, severity, location)
      setIncident(newIncident)
      startHeartbeat(newIncident.id)
    } catch (err) {
      console.error('Failed to trigger incident:', err)
    }
  }

  const resolveIncident = async (status: IncidentStatus) => {
    if (!incident) return
    try {
      await IncidentRepository.updateStatus(incident.id, status)
      setIncident(null)
      stopHeartbeat()
    } catch (err) {
      console.error('Failed to resolve incident:', err)
    }
  }

  useEffect(() => {
    return () => stopHeartbeat()
  }, [stopHeartbeat])

  return {
    incident,
    triggerIncident,
    resolveIncident,
    isMonitoring,
    setIsMonitoring,
    stopHeartbeat
  }
}
