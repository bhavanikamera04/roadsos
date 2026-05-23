import { useState, useCallback, useEffect } from 'react'
import { executeEmergencyResponse } from '../utils/emergency'
import { logIncident, getContacts } from '../utils/storage'
import type { EmergencyContact, EmergencyData, ActionResult } from '../utils/emergency'

export function useEmergency() {
  const [actionResults, setActionResults] = useState<ActionResult[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [firstAidSteps, setFirstAidSteps] = useState<string[]>([])
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  useEffect(() => {
    getContacts().then(stored => {
      if (stored.length > 0) {
        setContacts(stored)
      } else {
        setContacts([{ name: 'Family', phone: '9999999999', relationship: 'Family' }])
      }
    })
  }, [])

  const triggerEmergency = useCallback(async (
    lat: number,
    lon: number,
    severity: string,
    topHospital: string,
    topHospitalPhone: string,
    crashScore: number
  ) => {
    setIsExecuting(true)
    setEmergencyTriggered(true)

    const data: EmergencyData = {
      lat,
      lon,
      severity,
      topHospital,
      topHospitalPhone,
      timestamp: new Date().toLocaleTimeString('en-IN')
    }

    await logIncident({ lat, lon, severity, topHospital, crashScore })

    const results = await executeEmergencyResponse(data, contacts)

    const firstAidResult = results.find(r => r.action === 'First Aid')
    if (firstAidResult?.status === 'fulfilled') {
      setFirstAidSteps(firstAidResult.detail.split('\n'))
    }

    setActionResults(results)
    setIsExecuting(false)
  }, [contacts])

  const reset = useCallback(() => {
    setEmergencyTriggered(false)
    setActionResults([])
    setFirstAidSteps([])
  }, [])

  return {
    triggerEmergency,
    actionResults,
    isExecuting,
    firstAidSteps,
    emergencyTriggered,
    reset
  }
}