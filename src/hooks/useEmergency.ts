import { useState, useCallback, useEffect } from 'react'
import { EmergencyService } from '../services/emergencyService'
import { IncidentRepository } from '../repositories/incidentRepository'
import { useAuth } from './useAuth'
import { supabase } from '../api/supabase'
import type { EmergencyContact, EmergencyData, ActionResult } from '../utils/emergency'

export function useEmergency() {
  const { user } = useAuth()
  const [actionResults, setActionResults] = useState<ActionResult[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [firstAidSteps, setFirstAidSteps] = useState<string[]>([])
  const [emergencyTriggered, setEmergencyTriggered] = useState(false)
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return
      const { data, error } = await supabase.from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Fetch contacts error:', error)
        return
      }
      setContacts(data || [])
    }
    fetchContacts()
  }, [user])

  const triggerEmergency = useCallback(async (
    lat: number,
    lon: number,
    severity: string,
    topHospital: string,
    topHospitalPhone: string,
    incidentId: string
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

    try {
      // 1. Update incident to active in DB
      await IncidentRepository.updateStatus(incidentId, 'active')

      // 2. Execute real-world notifications via Service
      const results = await EmergencyService.executeResponse(data, contacts)

      const firstAidResult = results.find(r => r.action === 'First Aid')
      if (firstAidResult?.status === 'fulfilled') {
        setFirstAidSteps(firstAidResult.detail.split('\\n'))
      }

      setActionResults(results)
    } catch (err) {
      console.error('Emergency execution failed:', err)
    } finally {
      setIsExecuting(false)
    }
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
