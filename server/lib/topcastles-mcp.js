import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function summarise(castle) {
  return {
    castle_code: castle.castle_code,
    castle_name: castle.castle_name,
    position: castle.position,
    score_total: castle.score_total,
    score_visitors: castle.score_visitors,
    country: castle.country,
    region: castle.region,
    place: castle.place,
    era: castle.era,
    castle_type: castle.castle_type,
    castle_concept: castle.castle_concept,
    condition: castle.condition,
    latitude: castle.latitude,
    longitude: castle.longitude,
    heritage_status: castle.heritage_status ?? null,
    architectural_style: castle.architectural_style ?? null,
    wikipedia_extract: castle.wikipedia_extract
      ? castle.wikipedia_extract.slice(0, 300) + (castle.wikipedia_extract.length > 300 ? '...' : '')
      : null,
  };
}

export function createTopCastlesMcpServer(allCastles) {
  const byScore = [...allCastles].sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0));

  const server = new McpServer({
    name: 'topcastles',
    version: '1.0.0',
  });

  server.tool(
    'search_castles',
    'Search and filter castles. All parameters are optional; omit to get top results.',
    {
      query: z.string().optional().describe('Text search across castle name, description, remarkable, founder'),
      country: z.string().optional().describe('Filter by country name (case-insensitive)'),
      era: z.number().int().optional().describe('Filter by century of construction (e.g. 12 for 12th century)'),
      condition: z.string().optional().describe('Filter by condition (e.g. "Intact", "Ruined/Partly remained")'),
      castle_type: z.string().optional().describe('Filter by location type (e.g. "Hilltop castle", "Water castle")'),
      heritage: z.boolean().optional().describe('If true, only return castles with a heritage designation'),
      limit: z.number().int().min(1).max(100).optional().default(10).describe('Max results to return (default 10, max 100)'),
    },
    ({ query, country, era, condition, castle_type, heritage, limit = 10 }) => {
      let results = byScore;

      if (query) {
        const q = query.toLowerCase();
        results = results.filter(c =>
          c.castle_name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.remarkable?.toLowerCase().includes(q) ||
          c.founder?.toLowerCase().includes(q) ||
          c.wikipedia_extract?.toLowerCase().includes(q)
        );
      }
      if (country) results = results.filter(c => c.country?.toLowerCase() === country.toLowerCase());
      if (era != null) results = results.filter(c => c.era === era);
      if (condition) results = results.filter(c => c.condition?.toLowerCase().includes(condition.toLowerCase()));
      if (castle_type) results = results.filter(c => c.castle_type?.toLowerCase().includes(castle_type.toLowerCase()));
      if (heritage) results = results.filter(c => c.heritage_status);

      const items = results.slice(0, limit).map(summarise);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ total: results.length, returned: items.length, castles: items }, null, 2),
        }],
      };
    },
  );

  server.tool(
    'get_castle',
    'Get full details for a single castle by its code.',
    {
      castle_code: z.string().describe('The castle_code identifier (e.g. "krak-des-chevaliers")'),
    },
    ({ castle_code }) => {
      const castle = allCastles.find(c => c.castle_code === castle_code);
      if (!castle) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: `Castle '${castle_code}' not found` }) }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(castle, null, 2) }],
      };
    },
  );

  server.tool(
    'list_countries',
    'List all countries in the dataset with castle counts and top-scoring castle.',
    {},
    () => {
      const map = new Map();
      for (const c of byScore) {
        if (!c.country) continue;
        if (!map.has(c.country)) {
          map.set(c.country, { country: c.country, count: 0, top_castle: c.castle_name, top_score: c.score_total });
        }
        map.get(c.country).count++;
      }
      const countries = [...map.values()].sort((a, b) => b.count - a.count);
      return {
        content: [{ type: 'text', text: JSON.stringify({ total: countries.length, countries }, null, 2) }],
      };
    },
  );

  server.tool(
    'nearby_castles',
    'Find castles nearest to given coordinates.',
    {
      latitude: z.number().describe('Latitude (WGS84)'),
      longitude: z.number().describe('Longitude (WGS84)'),
      limit: z.number().int().min(1).max(20).optional().default(5).describe('Number of results (default 5)'),
      max_km: z.number().optional().describe('Maximum distance in kilometres'),
    },
    ({ latitude, longitude, limit = 5, max_km }) => {
      let results = allCastles
        .filter(c => c.latitude != null && c.longitude != null)
        .map(c => ({
          ...summarise(c),
          distance_km: Math.round(haversineKm(latitude, longitude, c.latitude, c.longitude)),
        }))
        .sort((a, b) => a.distance_km - b.distance_km);

      if (max_km != null) results = results.filter(r => r.distance_km <= max_km);
      results = results.slice(0, limit);

      return {
        content: [{ type: 'text', text: JSON.stringify({ castles: results }, null, 2) }],
      };
    },
  );

  return server;
}
