import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import express from 'express';
import supertest from 'supertest';

const TOKEN = 'test-castles-token';

const FIXTURE_ENRICHED = [
  {
    position: 1,
    castle_code: 'krak-des-chevaliers',
    castle_name: 'Krak des Chevaliers',
    country: 'Syria',
    latitude: 34.756,
    longitude: 36.294,
    place: 'Homs Governorate',
    region: '',
    region_code: '',
    castle_type: 'Crusader castle',
    castle_concept: '',
    condition: 'Intact/Maintained',
    era: 12,
    founder: 'Knights Hospitaller',
    inception_year: 1031,
    description: '',
    website: '',
    score_total: 950,
    score_visitors: 12.5,
    visitors: 500,
  },
  {
    position: 2,
    castle_code: 'eilean-donan',
    castle_name: 'Eilean Donan Castle',
    country: 'Scotland',
    latitude: 57.274,
    longitude: -5.516,
    place: 'Dornie',
    region: 'Ross-shire',
    region_code: 'ross-shire',
    castle_type: 'Island castle',
    castle_concept: '',
    condition: 'Rebuild/Restored',
    era: 13,
    founder: '',
    inception_year: 1220,
    description: '',
    website: '',
    score_total: 880,
    score_visitors: 10.1,
    visitors: 400,
  },
];

async function buildApp(tmpDir, enrichedPath) {
  process.env.DATA_DIR = tmpDir;
  process.env.ADMIN_TOKEN = TOKEN;
  process.env.CASTLES_ENRICHED_PATH = enrichedPath;

  const url = `./admin-castles.js?t=${Date.now()}`;
  const { default: adminCastlesRoutes } = await import(url);

  const app = express();
  app.use('/api/admin/castles', adminCastlesRoutes);
  return supertest(app);
}

describe('GET /api/admin/castles/lookup', () => {
  let tmpDir, enrichedPath, request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'castles-lookup-'));
    enrichedPath = path.join(tmpDir, 'castles_enriched.json');
    await writeFile(enrichedPath, JSON.stringify(FIXTURE_ENRICHED));
    request = await buildApp(tmpDir, enrichedPath);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
    delete process.env.CASTLES_ENRICHED_PATH;
  });

  it('missing token → 401', async () => {
    const res = await request.get('/api/admin/castles/lookup?q=krak');
    assert.equal(res.status, 401);
  });

  it('short query → empty array', async () => {
    const res = await request
      .get('/api/admin/castles/lookup?q=k')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it('matches by code', async () => {
    const res = await request
      .get('/api/admin/castles/lookup?q=krak')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].code, 'krak-des-chevaliers');
  });

  it('matches by name fragment', async () => {
    const res = await request
      .get('/api/admin/castles/lookup?q=eilean')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body[0].code, 'eilean-donan');
  });
});

describe('GET /api/admin/castles (overrides map)', () => {
  let tmpDir, enrichedPath, request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'castles-get-all-'));
    enrichedPath = path.join(tmpDir, 'castles_enriched.json');
    await writeFile(enrichedPath, JSON.stringify(FIXTURE_ENRICHED));
    request = await buildApp(tmpDir, enrichedPath);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
    delete process.env.CASTLES_ENRICHED_PATH;
  });

  it('returns empty object when no overrides', async () => {
    const res = await request
      .get('/api/admin/castles')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {});
  });
});

describe('GET /api/admin/castles/:code', () => {
  let tmpDir, enrichedPath, request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'castles-get-'));
    enrichedPath = path.join(tmpDir, 'castles_enriched.json');
    await writeFile(enrichedPath, JSON.stringify(FIXTURE_ENRICHED));
    request = await buildApp(tmpDir, enrichedPath);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
    delete process.env.CASTLES_ENRICHED_PATH;
  });

  it('unknown code → 404', async () => {
    const res = await request
      .get('/api/admin/castles/unknown-castle')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 404);
  });

  it('known code, no override → returns enriched + null override', async () => {
    const res = await request
      .get('/api/admin/castles/krak-des-chevaliers')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'krak-des-chevaliers');
    assert.ok(res.body.enriched !== null);
    assert.equal(res.body.enriched.castle_name, 'Krak des Chevaliers');
    assert.equal(res.body.override, null);
  });
});

describe('PUT /api/admin/castles/:code', () => {
  let tmpDir, enrichedPath, request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'castles-put-'));
    enrichedPath = path.join(tmpDir, 'castles_enriched.json');
    await writeFile(enrichedPath, JSON.stringify(FIXTURE_ENRICHED));
    request = await buildApp(tmpDir, enrichedPath);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
    delete process.env.CASTLES_ENRICHED_PATH;
  });

  it('unknown code → 404', async () => {
    const res = await request
      .put('/api/admin/castles/unknown-castle')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ castle_name: 'x' });
    assert.equal(res.status, 404);
  });

  it('no editable fields → 400', async () => {
    const res = await request
      .put('/api/admin/castles/krak-des-chevaliers')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ score_total: 999 }); // non-editable
    assert.equal(res.status, 400);
  });

  it('invalid numeric field type → 400', async () => {
    const res = await request
      .put('/api/admin/castles/krak-des-chevaliers')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ latitude: 'not-a-number' });
    assert.equal(res.status, 400);
  });

  it('valid fields → 200, override stored', async () => {
    const res = await request
      .put('/api/admin/castles/krak-des-chevaliers')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ castle_name: 'Krak des Chevaliers (corrected)', latitude: 34.756 });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'krak-des-chevaliers');
    assert.equal(res.body.override.castle_name, 'Krak des Chevaliers (corrected)');
  });

  it('GET after PUT returns stored override', async () => {
    const res = await request
      .get('/api/admin/castles/krak-des-chevaliers')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.override.castle_name, 'Krak des Chevaliers (corrected)');
  });

  it('PUT full-replaces (does not merge with previous override)', async () => {
    // First PUT set castle_name + latitude; now PUT with only country
    const res = await request
      .put('/api/admin/castles/krak-des-chevaliers')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ country: 'Syria (corrected)' });
    assert.equal(res.status, 200);
    // castle_name from the previous PUT should be gone
    assert.equal(res.body.override.castle_name, undefined);
    assert.equal(res.body.override.country, 'Syria (corrected)');
  });

  it('non-editable fields are silently stripped', async () => {
    const res = await request
      .put('/api/admin/castles/eilean-donan')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ place: 'Dornie', score_total: 9999, wikipedia_url: 'x' });
    assert.equal(res.status, 200);
    assert.equal(res.body.override.score_total, undefined);
    assert.equal(res.body.override.wikipedia_url, undefined);
    assert.equal(res.body.override.place, 'Dornie');
  });
});

describe('POST /api/admin/castles', () => {
  let tmpDir, enrichedPath, request;

  before(async () => {
    tmpDir = await mkdtemp(path.join(tmpdir(), 'castles-post-'));
    enrichedPath = path.join(tmpDir, 'castles_enriched.json');
    await writeFile(enrichedPath, JSON.stringify(FIXTURE_ENRICHED));
    request = await buildApp(tmpDir, enrichedPath);
  });

  after(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
    delete process.env.ADMIN_TOKEN;
    delete process.env.CASTLES_ENRICHED_PATH;
  });

  it('invalid castle_code → 400', async () => {
    const res = await request
      .post('/api/admin/castles')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ castle_code: 'UPPERCASE', castle_name: 'X', country: 'Y', place: 'Z', latitude: 1, longitude: 2 });
    assert.equal(res.status, 400);
  });

  it('castle_code already in enriched → 409', async () => {
    const res = await request
      .post('/api/admin/castles')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ castle_code: 'eilean-donan', castle_name: 'X', country: 'Y', place: 'Z', latitude: 1, longitude: 2 });
    assert.equal(res.status, 409);
  });

  it('missing required field → 400', async () => {
    const res = await request
      .post('/api/admin/castles')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ castle_code: 'new-castle-01', castle_name: 'New Castle', country: 'Ireland' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('place') || res.body.error.includes('latitude'));
  });

  it('valid new castle draft → 201, stored in overrides', async () => {
    const res = await request
      .post('/api/admin/castles')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        castle_code: 'new-castle-01',
        castle_name: 'New Castle',
        country: 'Ireland',
        place: 'Kilkenny',
        latitude: 52.654,
        longitude: -7.254,
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.code, 'new-castle-01');
    assert.equal(res.body.override.castle_name, 'New Castle');
  });

  it('duplicate draft → 409', async () => {
    const res = await request
      .post('/api/admin/castles')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        castle_code: 'new-castle-01',
        castle_name: 'New Castle',
        country: 'Ireland',
        place: 'Kilkenny',
        latitude: 52.654,
        longitude: -7.254,
      });
    assert.equal(res.status, 409);
  });

  it('GET after POST returns new draft with enriched: null', async () => {
    const res = await request
      .get('/api/admin/castles/new-castle-01')
      .set('Authorization', `Bearer ${TOKEN}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.enriched, null);
    assert.equal(res.body.override.castle_name, 'New Castle');
  });
});
