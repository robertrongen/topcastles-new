export interface Castle {
  position: number;
  castle_code: string;
  castle_name: string;
  country: string;
  area: string;
  place: string;
  region: string;
  region_code: string;
  latitude: number | null;
  longitude: number | null;
  founder: string;
  era: number | null;
  castle_type: string;
  castle_concept: string;
  condition: string;
  remarkable: string;
  description: string;
  website: string;
  score_total: number | null;
  score_visitors: number | null;
  visitors: number | null;
}

export interface CountrySummary {
  country: string;
  castleCount: number;
  totalScore: number;
}

export interface RegionSummary {
  region: string;
  country: string;
  castleCount: number;
  totalScore: number;
}
