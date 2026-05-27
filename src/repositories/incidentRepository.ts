import { supabase } from '../api/supabase'
import type { User } from '@supabase/supabase-js'

export type IncidentStatus = 'pending' | 'active' | 'resolved' | 'false_positive'

export interface Incident {
  id: string
  user_id: string | null
  status: IncidentStatus
  severity_score: number
  final_location: string | null
  start_time: string
}

export interface Heartbeat {
  incident_id: string
  location: string
  battery_level: number
  network_strength: string
  sensor_confidence: number
}

export const IncidentRepository = {
  async createIncident(userId: string | null, severity: number, location: { lat: number, lon: number }): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert({
        user_id: userId,
        severity_score: severity,
        final_location: `POINT(${location.lon} ${location.lat})`,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(incidentId: string, status: IncidentStatus): Promise<void> {
    const { error } = await supabase
      .from('incidents')
      .update({ status })
      .eq('id', incidentId)

    if (error) throw error
  },

  async sendHeartbeat(heartbeat: Heartbeat): Promise<void> {
    const { error } = await supabase
      .from('incident_heartbeats')
      .insert({
        ...heartbeat,
        location: `POINT(${heartbeat.location})` // Expecting "lon lat" string
      })

    if (error) throw error
  },

  async getActiveIncidentForUser(userId: string): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error
    return data
  }
}
