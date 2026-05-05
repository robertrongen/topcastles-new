import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, '..');
export const CASTLES_PATH = path.join(ROOT, 'new_app', 'public', 'api', 'castles.json');
export const MAPS_DIR = path.join(ROOT, 'new_app', 'public', 'images', 'maps');
export const MANIFEST_PATH = path.join(MAPS_DIR, 'manifest.json');
export const RAW_DIR = path.join(MAPS_DIR, '_raw');
export const LICENSE_PATH = path.join(MAPS_DIR, 'LICENSE.locators.md');

export async function readJson(filePath, fallback = undefined) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch (error) {
    if (error.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw error;
  }
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function slugify(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildRegionInventory(castles) {
  const map = new Map();

  for (const castle of castles) {
    const region = clean(castle.region);
    const country = clean(castle.country);
    const regionCode = clean(castle.region_code) || slugify(region);
    if (!regionCode) continue;

    const item = map.get(regionCode) ?? {
      regionCode,
      regions: new Set(),
      countries: new Set(),
      castleCount: 0,
      hasLegacyMap: false,
    };

    if (region) item.regions.add(region);
    if (country) item.countries.add(country);
    item.castleCount++;
    map.set(regionCode, item);
  }

  return [...map.values()]
    .map(item => ({
      regionCode: item.regionCode,
      regions: [...item.regions].sort(localeSort),
      countries: [...item.countries].sort(localeSort),
      castleCount: item.castleCount,
      hasLegacyMap: item.hasLegacyMap,
    }))
    .sort((a, b) => a.regionCode.localeCompare(b.regionCode));
}

export async function markLegacyMaps(inventory) {
  const files = new Set(await fs.readdir(MAPS_DIR).catch(() => []));
  return inventory.map(item => ({
    ...item,
    hasLegacyMap: files.has(`${item.regionCode}.jpg`) || files.has(`${item.regionCode}.png`),
  }));
}

export function mergeManifest(inventory, existingManifest = {}) {
  const next = {};

  for (const item of inventory) {
    const existing = existingManifest[item.regionCode] ?? {};
    next[item.regionCode] = {
      regionCode: item.regionCode,
      regions: item.regions,
      countries: item.countries,
      castleCount: item.castleCount,
      hasLegacyMap: item.hasLegacyMap,
      commons: existing.commons ?? '',
      highlightHueRGB: existing.highlightHueRGB ?? null,
      bgMode: existing.bgMode ?? 'white',
      credit: existing.credit ?? '',
      license: existing.license ?? '',
      sourceUrl: existing.sourceUrl ?? '',
      notes: existing.notes ?? '',
      candidates: existing.candidates ?? [],
    };
  }

  return next;
}

export function configuredEntries(manifest) {
  return Object.entries(manifest).filter(([, entry]) => isConfigured(entry));
}

export function fetchableEntries(manifest) {
  return Object.entries(manifest).filter(([, entry]) => isFetchable(entry));
}

export function isConfigured(entry) {
  return Boolean(
    clean(entry?.commons) &&
    Array.isArray(entry?.highlightHueRGB) &&
    entry.highlightHueRGB.length === 3 &&
    entry.highlightHueRGB.every(n => Number.isInteger(n) && n >= 0 && n <= 255)
  );
}

export function isFetchable(entry) {
  return Boolean(clean(entry?.commons));
}

export function manifestSummary(manifest) {
  const entries = Object.values(manifest);
  const configured = entries.filter(isConfigured);
  return {
    total: entries.length,
    configured: configured.length,
    unresolved: entries.length - configured.length,
  };
}

export function validateManifest(manifest, inventory) {
  const errors = [];
  const inventoryCodes = new Set(inventory.map(item => item.regionCode));

  for (const code of inventoryCodes) {
    if (!manifest[code]) errors.push(`Missing manifest entry for region_code "${code}".`);
  }

  for (const [code, entry] of Object.entries(manifest)) {
    if (!inventoryCodes.has(code)) errors.push(`Manifest entry "${code}" is not present in castles.json.`);
    if (entry.bgMode && !['white', 'pastel'].includes(entry.bgMode)) {
      errors.push(`Manifest entry "${code}" has invalid bgMode "${entry.bgMode}".`);
    }
    if (clean(entry.commons) && !isConfigured(entry)) {
      errors.push(`Manifest entry "${code}" with commons must include highlightHueRGB [0..255, 0..255, 0..255].`);
    }
  }

  return errors;
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

export function recolourLocatorPixels(px, entry, pal) {
  const [hh] = rgbToHsl(...entry.highlightHueRGB);
  const bgMin = entry.bgMode === 'pastel' ? 0.94 : 0.92;
  const dh = entry.dh ?? 0.08;
  const sMin = entry.smin ?? 0.25;
  const lMax = entry.lmax ?? 0.70;

  const ochre = pal.OCHRE;
  const neighbour = pal.NEIGHBOUR;
  const coast = pal.COAST;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    let dist = Math.abs(h - hh);
    if (dist > 0.5) dist = 1 - dist;

    if (s > sMin && dist < dh && l < lMax) {
      const k = 0.85 + 0.30 * (0.55 - l);
      px[i] = clamp(ochre[0] * k);
      px[i + 1] = clamp(ochre[1] * k);
      px[i + 2] = clamp(ochre[2] * k);
      continue;
    }

    if (l > bgMin) {
      px[i + 3] = 0;
      continue;
    }

    if (l < 0.22) {
      px[i] = coast[0];
      px[i + 1] = coast[1];
      px[i + 2] = coast[2];
      continue;
    }

    const k = l - 0.4;
    px[i] = Math.round(neighbour[0] + k * 28);
    px[i + 1] = Math.round(neighbour[1] + k * 28);
    px[i + 2] = Math.round(neighbour[2] + k * 32);
  }
}

export function commonsFilePathUrl(filename) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
}

export function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function localeSort(a, b) {
  return a.localeCompare(b);
}
