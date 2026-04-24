import { Castle } from '../models/castle.model';

const COUNTRIES = ['England', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Austria', 'Poland'];
const TYPES = ['Mountain castle', 'Water castle', 'City castle', 'Rock castle'];
const CONDITIONS = ['Intact', 'Rebuild/Restored', 'Damaged', 'Ruined/Partly remained'];

export function generateCastles(count: number): Castle[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    castle_code: `castle_${i}`,
    castle_name: `Castle ${i + 1}`,
    country: COUNTRIES[i % COUNTRIES.length],
    area: COUNTRIES[i % COUNTRIES.length],
    place: `Town ${i + 1}`,
    region: `Region ${Math.floor(i / 8) + 1}`,
    region_code: `region_${Math.floor(i / 8)}`,
    latitude: 48 + (i % 10),
    longitude: 5 + (i % 20),
    score_total: Math.max(1, 1000 - i),
    score_visitors: (i % 5) + 1,
    castle_type: TYPES[i % TYPES.length],
    castle_concept: '',
    condition: CONDITIONS[i % CONDITIONS.length],
    era: 10 + (i % 8),
    founder: '',
    remarkable: '',
    description: '',
    website: '',
    visitors: (1000 - i) * 1000,
  }));
}

export const minimalCastle: Castle = {
  ...generateCastles(1)[0],
  position: 1,
  castle_code: 'minimal',
  castle_name: 'Minimal Castle',
  country: 'Netherlands',
  place: '',
  region: '',
  region_code: '',
  score_total: 1,
  score_visitors: null,
  era: null,
  castle_type: '',
  condition: '',
  visitors: null,
};

export const favoriteCastleSet = {
  id: 'storybook-favorites',
  name: 'Storybook favorites',
  castleIds: ['castle_0', 'minimal'],
};
