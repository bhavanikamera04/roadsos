// =============================
// Scoring Engine (Single Source of Truth)
// =============================

export type Severity = "LOW" | "HIGH";

export interface Hospital {
  id: string;
  name: string;
  location: { lat: number; lon: number } | string;
  trauma_score: number;
  has_icu: boolean;
  is_24hr: boolean;
  level: number;
  specialty: string;
  phone: string;
  facility_type: string;
}

export interface ScoredHospital extends Hospital {
  distance_km: number;
  final_score: number;
}

// =============================
// Distance Calculation
// =============================

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// =============================
// Normalization (keeps score stable)
// =============================

export function normalizeDistance(km: number): number {
  return 1 / (1 + km / 10);
}

// =============================
// Location Parser (kept safe & isolated)
// =============================

function parseLocation(location: string | { lat: number; lon: number }) {
  if (typeof location === "string") {
    // Expected format: POINT(lon lat)
    const coords = location
      .replace("POINT(", "")
      .replace(")", "")
      .split(" ");

    const lon = parseFloat(coords[0]);
    const lat = parseFloat(coords[1]);

    return { lat, lon };
  }

  return location;
}

// =============================
// Core Scoring Function
// =============================

export function scoreHospitals(
  userLat: number,
  userLon: number,
  hospitals: Hospital[],
  severity: Severity = "HIGH"
): ScoredHospital[] {
  const weights =
    severity === "HIGH"
      ? {
          trauma: 0.6,
          distance: 0.2,
          icu: 0.15,
          is24hr: 0.05,
        }
      : {
          trauma: 0.3,
          distance: 0.4,
          icu: 0.2,
          is24hr: 0.1,
        };

  const scored = hospitals.map((hospital) => {
    const { lat, lon } = parseLocation(hospital.location);

    const distance_km = haversineDistance(userLat, userLon, lat, lon);

    const dist_score = normalizeDistance(distance_km);

    const final_score =
      hospital.trauma_score * weights.trauma +
      dist_score * weights.distance +
      (hospital.has_icu ? 1 : 0) * weights.icu +
      (hospital.is_24hr ? 1 : 0) * weights.is24hr;

    return {
      ...hospital,
      distance_km,
      final_score,
    };
  });

  // FINAL SORT = CRITICAL (this defines correctness of your system)
  return scored.sort((a, b) => b.final_score - a.final_score);
}