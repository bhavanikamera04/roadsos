export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const toRad = (deg: number) => deg * (Math.PI / 180)
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function normalizeDistance(km: number): number {
  return 1 / (1 + km / 10)
}

export type Severity = 'LOW' | 'HIGH'

export interface Hospital {
  id: number
  name: string
  lat: number
  lon: number
  trauma_score: number
  has_icu: boolean
  is_24hr: boolean
  level: number
  specialty: string
  phone: string
}

export interface ScoredHospital extends Hospital {
  distance_km: number
  final_score: number
}

export function scoreHospitals(
  userLat: number,
  userLon: number,
  hospitals: Hospital[],
  severity: Severity = 'HIGH'
): ScoredHospital[] {

  const weights = severity === 'HIGH'
    ? { trauma: 0.60, distance: 0.20, icu: 0.15, is24hr: 0.05 }
    : { trauma: 0.30, distance: 0.40, icu: 0.20, is24hr: 0.10 }

  return hospitals
    .map(hospital => {
      const distance_km = haversineDistance(
        userLat, userLon,
        hospital.lat, hospital.lon
      )
      const dist_score = normalizeDistance(distance_km)
      const final_score =
        (hospital.trauma_score * weights.trauma) +
        (dist_score * weights.distance) +
        ((hospital.has_icu ? 1 : 0) * weights.icu) +
        ((hospital.is_24hr ? 1 : 0) * weights.is24hr)

      return { ...hospital, distance_km, final_score }
    })
    .sort((a, b) => b.final_score - a.final_score)
}