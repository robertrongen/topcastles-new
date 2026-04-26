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

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

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

  console.log(`\n${passed + failed} checks: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Smoke test runner error:', e);
  process.exit(1);
});
