import { useState, useEffect } from 'react'
import { scoreHospitals, type ScoredHospital, type Severity } from '../core/routing/scoring'
import { HospitalRepository } from '../repositories/hospitalRepository'

export function useHospitals(severity: Severity = 'HIGH') {
  const [ranked, setRanked] = useState<ScoredHospital[]>([])
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    const fetchAndRank = async (lat: number, lon: number) => {
      try {
        // Fetch hospitals from Supabase
        const hospitals = await HospitalRepository.getAllHospitals()
        setRanked(scoreHospitals(lat, lon, hospitals, severity))
      } catch (err) {
        console.error('Hospital fetch failed:', err)
        setLocationError('Failed to load hospital data from server.')
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords
        fetchAndRank(lat, lon)
      },
      () => {
        // Demo fallback — NH-65 near Shadnagar
        fetchAndRank(17.0693, 78.2059)
        setLocationError('Using demo location: NH-65 Shadnagar')
      }
    )
  }, [severity])

  return { ranked, locationError }
}
