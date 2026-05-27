import { supabase } from '../api/supabase'
import type { EmergencyData, ActionResult } from '../utils/emergency'

export const EmergencyService = {
  async executeResponse(data: EmergencyData, contacts: any[]): Promise<ActionResult[]> {
    const results: ActionResult[] = []

    // 1. Notify Emergency Contacts via Backend
    // In a real world case, this would call a Supabase Edge Function that uses Twilio/Resend
    const contactNotification = async () => {
      try {
        // Simulate API call to Edge Function
        await supabase.functions.invoke('send-emergency-sms', {
          body: { data, contacts }
        })
        return { action: 'Notify Contacts', status: 'fulfilled', detail: 'SMS sent to all contacts' }
      } catch (e) {
        return { action: 'Notify Contacts', status: 'rejected', detail: 'SMS Gateway failed' }
      }
    }

    // 2. Notify Nearest Hospital
    const hospitalNotification = async () => {
      try {
        await supabase.functions.invoke('notify-hospital', {
          body: { hospital: data.topHospital, location: data.lat + ',' + data.lon }
        })
        return { action: 'Hospital Alert', status: 'fulfilled', detail: 'Hospital notified' }
      } catch (e) {
        return { action: 'Hospital Alert', status: 'rejected', detail: 'Hospital API unreachable' }
      }
    }

    // 3. First Aid Logic (Local)
    const firstAid = async () => {
      return {
        action: 'First Aid',
        status: 'fulfilled',
        detail: '1. Check airway\\n2. Control bleeding\\n3. Stabilize neck'
      }
    }

    const [res1, res2, res3] = await Promise.all([
      contactNotification(),
      hospitalNotification(),
      firstAid()
    ])

    return [res1, res2, res3]
  }
}
