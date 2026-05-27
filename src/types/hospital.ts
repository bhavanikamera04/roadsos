export type Severity = "LOW" | "HIGH";

export interface Hospital {
  id: string;
  name: string;

  // location from Supabase or frontend-safe object
  location: { lat: number; lon: number } | string;

  // core medical scoring attributes
  trauma_score: number;
  has_icu: boolean;
  is_24hr: boolean;

  // additional metadata (not used heavily in scoring but useful for UI)
  level: number;
  specialty: string;
  phone: string;
  facility_type: string;
}

export interface ScoredHospital extends Hospital {
  distance_km: number;
  final_score: number;
}