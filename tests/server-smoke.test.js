#!/usr/bin/env node
/**
 * Server smoke tests — runtime verification of the deployed Node server.
 *
 * Usage:
 *   node tests/server-smoke.test.js [base-url]
 *   npm run test:smoke -- http://localhost:3000
 *
 * Exits 0 on pass, 1 on any failure.
 */

const { readFileSync, existsSync } = require('fs');
const path = require('path');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

const ENRICHED_PATH = path.join(__dirname, '../new_app/src/assets/data/castles_enriched.json');
const enrichedCastles = existsSync(ENRICHED_PATH)
  ? JSON.parse(readFileSync(ENRICHED_PATH, 'utf-8'))
  : null;

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✓  ${label}`);
  passed++;
}

function fail(label, detail) {
  console.error(`  ✗  ${label}`);
  if (detail) console.error(`     ${detail}`);
  failed++;
}

async function get(path, headers = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers, redirect: 'manual' });
  const body = await res.text().catch(() => '');
  return { status: res.status, headers: res.headers, body };
}

async function post(path, body, headers = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await res.text().catch(() => '');
  return { status: res.status, headers: res.headers, body: text };
}

async function run() {
  console.log(`\nSmoke tests against ${BASE}\n`);

  // 1. / returns 200
  try {
    const { status } = await get('/');
    status === 200
      ? ok('GET / returns 200')
      : fail('GET / returns 200', `got ${status}`);
  } catch (e) {
    fail('GET / returns 200', e.message);
  }

  // 2. /api/health returns healthy JSON
  try {
    const { status, body } = await get('/api/health');
    const json = JSON.parse(body);
    if (status === 200 && json?.status === 'ok') {
      ok('/api/health returns { status: "ok" }');
    } else {
      fail('/api/health returns { status: "ok" }', `status=${status} body=${body.slice(0, 120)}`);
    }
  } catch (e) {
    fail('/api/health returns { status: "ok" }', e.message);
  }

  // 3. /api/index.json returns 200
  try {
    const { status } = await get('/api/index.json');
    status === 200
      ? ok('GET /api/index.json returns 200')
      : fail('GET /api/index.json returns 200', `got ${status}`);
  } catch (e) {
    fail('GET /api/index.json returns 200', e.message);
  }

  // 4. Unknown route returns SPA shell (200 + HTML)
  try {
    const { status, body } = await get('/this-route-does-not-exist-xyz');
    if (status === 200 && body.includes('<app-root')) {
      ok('Unknown route returns SPA shell (200 + <app-root>)');
    } else {
      fail('Unknown route returns SPA shell', `status=${status} html=${body.slice(0, 80)}`);
    }
  } catch (e) {
    fail('Unknown route returns SPA shell', e.message);
  }

  // 5. Representative deep link returns 200 (prerendered castle detail)
  try {
    const { status } = await get('/castle/1');
    status === 200
      ? ok('GET /castle/1 (deep link) returns 200')
      : fail('GET /castle/1 (deep link) returns 200', `got ${status}`);
  } catch (e) {
    fail('GET /castle/1 (deep link) returns 200', e.message);
  }

  // 6. /castle-images/* missing file returns 404
  try {
    const { status } = await get('/castle-images/__nonexistent_smoke_test_image__.jpg');
    status === 404
      ? ok('GET /castle-images/missing returns 404')
      : fail('GET /castle-images/missing returns 404', `got ${status}`);
  } catch (e) {
    fail('GET /castle-images/missing returns 404', e.message);
  }

  // 7. gzip is applied to compressible responses
  try {
    const { status, headers } = await get('/', { 'Accept-Encoding': 'gzip' });
    const enc = headers.get('content-encoding') || '';
    if (status === 200 && enc.includes('gzip')) {
      ok('GET / with Accept-Encoding: gzip returns gzip response');
    } else {
      fail('GET / with Accept-Encoding: gzip returns gzip response', `status=${status} content-encoding="${enc}"`);
    }
  } catch (e) {
    fail('GET / with Accept-Encoding: gzip returns gzip response', e.message);
  }

  // 8. /api/admin/health without token → 401
  try {
    const { status, body } = await get('/api/admin/health');
    const json = JSON.parse(body);
    if (status === 401 && json?.error === 'Unauthorized') {
      ok('GET /api/admin/health without token returns 401 { error: "Unauthorized" }');
    } else {
      fail('GET /api/admin/health without token returns 401', `status=${status} body=${body.slice(0, 120)}`);
    }
  } catch (e) {
    fail('GET /api/admin/health without token returns 401', e.message);
  }

  // 9. /api/admin/health with valid token → 200 (only when ADMIN_TOKEN is set)
  if (ADMIN_TOKEN) {
    try {
      const { status, body } = await get('/api/admin/health', { 'Authorization': `Bearer ${ADMIN_TOKEN}` });
      const json = JSON.parse(body);
      if (status === 200 && json?.status === 'ok' && json?.auth === 'admin') {
        ok('GET /api/admin/health with valid token returns 200 { status: "ok", auth: "admin" }');
      } else {
        fail('GET /api/admin/health with valid token returns 200', `status=${status} body=${body.slice(0, 120)}`);
      }
    } catch (e) {
      fail('GET /api/admin/health with valid token returns 200', e.message);
    }
  } else {
    ok('GET /api/admin/health with valid token — skipped (ADMIN_TOKEN not set in test env)');
  }

  // --- upload-enriched endpoint tests (only when ADMIN_TOKEN is set) ---

  if (ADMIN_TOKEN) {
    const authHeader = { 'Authorization': `Bearer ${ADMIN_TOKEN}` };

    // 10. pending-status before upload — endpoint must exist (200 or 404)
    try {
      const { status } = await get('/api/admin/pending-status', authHeader);
      status === 200 || status === 404
        ? ok('GET /api/admin/pending-status returns 200 or 404 (endpoint live)')
        : fail('GET /api/admin/pending-status returns 200 or 404', `got ${status}`);
    } catch (e) {
      fail('GET /api/admin/pending-status', e.message);
    }

    // 11. upload-enriched without auth → 401
    try {
      const { status } = await post('/api/admin/upload-enriched', []);
      status === 401
        ? ok('POST /api/admin/upload-enriched without auth returns 401')
        : fail('POST /api/admin/upload-enriched without auth returns 401', `got ${status}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched without auth returns 401', e.message);
    }

    // 12. wrong Content-Type → 415
    try {
      const url = `${BASE}/api/admin/upload-enriched`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain', 'Authorization': `Bearer ${ADMIN_TOKEN}` },
        body: 'not json',
      });
      res.status === 415
        ? ok('POST /api/admin/upload-enriched with wrong Content-Type returns 415')
        : fail('POST /api/admin/upload-enriched with wrong Content-Type returns 415', `got ${res.status}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with wrong Content-Type returns 415', e.message);
    }

    // 13. empty array → 400
    try {
      const { status, body } = await post('/api/admin/upload-enriched', [], authHeader);
      const json = JSON.parse(body);
      status === 400 && json?.error?.includes('empty')
        ? ok('POST /api/admin/upload-enriched with empty array returns 400')
        : fail('POST /api/admin/upload-enriched with empty array returns 400', `status=${status} body=${body.slice(0, 120)}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with empty array returns 400', e.message);
    }

    // 14. too-few records → 400
    try {
      const few = Array.from({ length: 3 }, (_, i) => ({
        castle_code: `xx${i}`, latitude: 1.0, longitude: 1.0, score_total: 10 - i,
      }));
      const { status, body } = await post('/api/admin/upload-enriched', few, authHeader);
      const json = JSON.parse(body);
      status === 400 && json?.error?.includes('records')
        ? ok('POST /api/admin/upload-enriched with < 500 records returns 400')
        : fail('POST /api/admin/upload-enriched with < 500 records returns 400', `status=${status} body=${body.slice(0, 120)}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with < 500 records returns 400', e.message);
    }

    // 15. missing castle_code → 400
    try {
      const base = Array.from({ length: 500 }, (_, i) => ({
        castle_code: `xx${i}`, latitude: 1.0, longitude: 1.0, score_total: 500 - i,
      }));
      base[10] = { latitude: 1.0, longitude: 1.0, score_total: 490 };
      const { status, body } = await post('/api/admin/upload-enriched', base, authHeader);
      const json = JSON.parse(body);
      status === 400 && json?.error?.includes('castle_code')
        ? ok('POST /api/admin/upload-enriched with missing castle_code returns 400')
        : fail('POST /api/admin/upload-enriched with missing castle_code returns 400', `status=${status} body=${body.slice(0, 120)}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with missing castle_code returns 400', e.message);
    }

    // 16. duplicate castle_code → 400
    try {
      const base = Array.from({ length: 500 }, (_, i) => ({
        castle_code: `xx${i}`, latitude: 1.0, longitude: 1.0, score_total: 500 - i,
      }));
      base[20] = { ...base[20], castle_code: 'xx0' };
      const { status, body } = await post('/api/admin/upload-enriched', base, authHeader);
      const json = JSON.parse(body);
      status === 400 && json?.error?.includes('duplicate')
        ? ok('POST /api/admin/upload-enriched with duplicate castle_code returns 400')
        : fail('POST /api/admin/upload-enriched with duplicate castle_code returns 400', `status=${status} body=${body.slice(0, 120)}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with duplicate castle_code returns 400', e.message);
    }

    // 17. missing latitude → 400
    try {
      const base = Array.from({ length: 500 }, (_, i) => ({
        castle_code: `xx${i}`, latitude: 1.0, longitude: 1.0, score_total: 500 - i,
      }));
      delete base[5].latitude;
      const { status, body } = await post('/api/admin/upload-enriched', base, authHeader);
      const json = JSON.parse(body);
      status === 400 && (json?.error?.includes('latitude') || json?.error?.includes('latitude/longitude'))
        ? ok('POST /api/admin/upload-enriched with missing latitude returns 400')
        : fail('POST /api/admin/upload-enriched with missing latitude returns 400', `status=${status} body=${body.slice(0, 120)}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with missing latitude returns 400', e.message);
    }

    // 18. unsorted score_total → 400
    try {
      const base = Array.from({ length: 500 }, (_, i) => ({
        castle_code: `xx${i}`, latitude: 1.0, longitude: 1.0, score_total: 500 - i,
      }));
      base[100].score_total = 999;
      const { status, body } = await post('/api/admin/upload-enriched', base, authHeader);
      const json = JSON.parse(body);
      status === 400 && json?.error?.includes('score_total')
        ? ok('POST /api/admin/upload-enriched with unsorted score_total returns 400')
        : fail('POST /api/admin/upload-enriched with unsorted score_total returns 400', `status=${status} body=${body.slice(0, 120)}`);
    } catch (e) {
      fail('POST /api/admin/upload-enriched with unsorted score_total returns 400', e.message);
    }

    // 19. production-size payload → 200 (only when enriched file is available)
    if (enrichedCastles) {
      try {
        const { status, body } = await post('/api/admin/upload-enriched', enrichedCastles, authHeader);
        const json = JSON.parse(body);
        if (status === 200 && json?.recordCount === enrichedCastles.length) {
          ok(`POST /api/admin/upload-enriched with production payload returns 200 (${enrichedCastles.length} records)`);
        } else {
          fail(`POST /api/admin/upload-enriched with production payload returns 200`, `status=${status} body=${body.slice(0, 120)}`);
        }
      } catch (e) {
        fail('POST /api/admin/upload-enriched with production payload returns 200', e.message);
      }

      // 20. pending-status after upload → 200 with correct recordCount
      try {
        const { status, body } = await get('/api/admin/pending-status', authHeader);
        const json = JSON.parse(body);
        if (status === 200 && json?.recordCount === enrichedCastles.length && json?.uploadedAt) {
          ok(`GET /api/admin/pending-status after upload returns 200 (recordCount=${json.recordCount})`);
        } else {
          fail('GET /api/admin/pending-status after upload returns 200', `status=${status} body=${body.slice(0, 120)}`);
        }
      } catch (e) {
        fail('GET /api/admin/pending-status after upload returns 200', e.message);
      }
    } else {
      ok('POST /api/admin/upload-enriched production-size test — skipped (castles_enriched.json not found locally)');
      ok('GET /api/admin/pending-status post-upload — skipped (castles_enriched.json not found locally)');
    }
  } else {
    ok('upload-enriched tests — skipped (ADMIN_TOKEN not set in test env)');
  }

  console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Smoke test runner error:', e);
  process.exit(1);
});
