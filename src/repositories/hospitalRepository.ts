import { supabase } from '../api/supabase'
import type { Hospital } from '../core/routing/scoring'

export const HospitalRepository = {
  async getAllHospitals(): Promise<Hospital[]> {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('operational_status', true)

    if (error) {
      console.error('Error fetching hospitals:', error)
      throw error
    }

    return data as Hospital[]
  },

  async getNearbyHospitals(lat: number, lon: number, radiusMeters: number = 50000) {
    // Using Supabase RPC for PostGIS distance search
    // This requires creating a function in Supabase SQL Editor
    const { data, error } = await supabase.rpc('get_hospitals_within_radius', {
      user_lat: lat,
      user_lon: lon,
      radius: radiusMeters
    })

    if (error) {
      console.error('Error fetching nearby hospitals:', error)
      throw error
    }

    return data as Hospital[]
  }
}
