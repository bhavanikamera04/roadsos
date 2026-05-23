import { useState, useEffect } from 'react'
import { scoreHospitals } from '../utils/scoring'
import type { ScoredHospital, Severity } from '../utils/scoring'
import hospitalsData from '../data/hospitals.json'

export function useHospitals(severity: Severity = 'HIGH') {
  const [ranked, setRanked] = useState<ScoredHospital[]>([])
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords
        setRanked(scoreHospitals(lat, lon, hospitalsData as any, severity))
      },
      () => {
        // Demo fallback — NH-65 near Shadnagar
        setRanked(scoreHospitals(17.0693, 78.2059, hospitalsData as any, severity))
        setLocationError('Using demo location: NH-65 Shadnagar')
      }
    )
  }, [severity])

  return { ranked, locationError }
}