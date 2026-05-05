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

// Classification codes for the pixel mask
const CLS_BG = 0;
const CLS_HIGHLIGHT = 1;
const CLS_NEIGHBOUR = 2;
const CLS_COAST = 3;

export async function readJson(filePath, fallback = undefined) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text.replace(/^﻿/, ''));
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
      bgMode: existing.bgMode ?? null,
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

// An entry is configured when commons is set; hue and bgMode auto-detect if absent.
export function isConfigured(entry) {
  return Boolean(clean(entry?.commons));
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
    if (entry.bgMode != null && !['white', 'pastel'].includes(entry.bgMode)) {
      errors.push(`Manifest entry "${code}" has invalid bgMode "${entry.bgMode}".`);
    }
    if (entry.highlightHueRGB != null) {
      const rgb = entry.highlightHueRGB;
      if (!Array.isArray(rgb) || rgb.length !== 3 || !rgb.every(n => Number.isInteger(n) && n >= 0 && n <= 255)) {
        errors.push(`Manifest entry "${code}" has invalid highlightHueRGB — must be [0..255, 0..255, 0..255] or null.`);
      }
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

/**
 * Classify each pixel into CLS_BG / CLS_HIGHLIGHT / CLS_NEIGHBOUR / CLS_COAST.
 * Returns a Uint8Array of length px.length/4.
 * Pass width > 0 to enable the connected-component confetti filter.
 */
export function classifyPixels(px, entry, width = 0) {
  const [hh] = rgbToHsl(...entry.highlightHueRGB);
  const bgMin = entry.bgMode === 'pastel' ? 0.94 : 0.92;
  const dh = entry.dh ?? 0.08;
  const sMin = entry.smin ?? 0.25;
  const lMax = entry.lmax ?? 0.70;
  const pixelCount = px.length / 4;
  const mask = new Uint8Array(pixelCount);

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    let dist = Math.abs(h - hh);
    if (dist > 0.5) dist = 1 - dist;

    const pi = i / 4;
    if (s > sMin && dist < dh && l < lMax) {
      mask[pi] = CLS_HIGHLIGHT;
    } else if (l > bgMin) {
      mask[pi] = CLS_BG;
    } else if (l < 0.22) {
      mask[pi] = CLS_COAST;
    } else {
      mask[pi] = CLS_NEIGHBOUR;
    }
  }

  if (entry.filterConfetti !== false && width > 0) {
    const height = pixelCount / width;
    let totalHighlight = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === CLS_HIGHLIGHT) totalHighlight++;
    }
    const minSize = Math.max(Math.round(0.005 * totalHighlight), 25);

    const visited = new Uint8Array(pixelCount);
    for (let start = 0; start < pixelCount; start++) {
      if (mask[start] !== CLS_HIGHLIGHT || visited[start]) continue;

      const component = [];
      const stack = [start];
      visited[start] = 1;

      while (stack.length > 0) {
        const idx = stack.pop();
        component.push(idx);
        const x = idx % width;
        const y = Math.floor(idx / width);

        if (x > 0 && !visited[idx - 1] && mask[idx - 1] === CLS_HIGHLIGHT) {
          visited[idx - 1] = 1; stack.push(idx - 1);
        }
        if (x < width - 1 && !visited[idx + 1] && mask[idx + 1] === CLS_HIGHLIGHT) {
          visited[idx + 1] = 1; stack.push(idx + 1);
        }
        if (y > 0 && !visited[idx - width] && mask[idx - width] === CLS_HIGHLIGHT) {
          visited[idx - width] = 1; stack.push(idx - width);
        }
        if (y < height - 1 && !visited[idx + width] && mask[idx + width] === CLS_HIGHLIGHT) {
          visited[idx + width] = 1; stack.push(idx + width);
        }
      }

      if (component.length < minSize) {
        for (const idx of component) mask[idx] = CLS_NEIGHBOUR;
      }
    }
  }

  return mask;
}

/**
 * Paint pixels in-place using the pre-computed classification mask and palette.
 * The original px values are used to compute tonal variation within each class.
 */
export function paintPixels(px, mask, pal) {
  const ochre = pal.OCHRE;
  const neighbour = pal.NEIGHBOUR;
  const coast = pal.COAST;

  for (let i = 0; i < px.length; i += 4) {
    const pi = i / 4;
    const cls = mask[pi];

    switch (cls) {
      case CLS_HIGHLIGHT: {
        const l = rgbToHsl(px[i], px[i + 1], px[i + 2])[2];
        const k = 0.85 + 0.30 * (0.55 - l);
        px[i] = clamp(ochre[0] * k);
        px[i + 1] = clamp(ochre[1] * k);
        px[i + 2] = clamp(ochre[2] * k);
        break;
      }
      case CLS_BG:
        px[i + 3] = 0;
        break;
      case CLS_COAST:
        px[i] = coast[0];
        px[i + 1] = coast[1];
        px[i + 2] = coast[2];
        break;
      case CLS_NEIGHBOUR: {
        const l = rgbToHsl(px[i], px[i + 1], px[i + 2])[2];
        const k = l - 0.4;
        px[i] = Math.round(neighbour[0] + k * 28);
        px[i + 1] = Math.round(neighbour[1] + k * 28);
        px[i + 2] = Math.round(neighbour[2] + k * 32);
        break;
      }
    }
  }
}

// Backward-compatible wrapper — confetti filter disabled (no width).
export function recolourLocatorPixels(px, entry, pal) {
  const mask = classifyPixels(px, entry, 0);
  paintPixels(px, mask, pal);
}

/**
 * Auto-detect the highlight hue from a raw locator map file.
 * Buckets fully-opaque, saturated, mid-lightness pixels by hue.
 * Returns the average RGB of the largest minority bucket (0.5%–50% of considered pixels),
 * or null when no qualifying bucket exists.
 */
export async function detectHighlightHue(rawPath) {
  const sharp = await loadSharp();
  const { data } = await sharp(rawPath, { density: 300, limitInputPixels: false })
    .resize({ width: 400, height: 400, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const BUCKETS = 24;
  const buckets = Array.from({ length: BUCKETS }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
  let considered = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 255) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    // Wide thresholds to handle both vivid and light-coloured locator SVGs.
    if (s <= 0.10 || l < 0.20 || l > 0.85) continue;
    const bucket = Math.floor(h * BUCKETS) % BUCKETS;
    buckets[bucket].r += r;
    buckets[bucket].g += g;
    buckets[bucket].b += b;
    buckets[bucket].count++;
    considered++;
  }

  if (considered === 0) return null;

  let best = null;
  let bestCount = 0;

  for (const bkt of buckets) {
    const share = bkt.count / considered;
    if (share < 0.005 || share > 0.50) continue;
    if (bkt.count > bestCount) {
      bestCount = bkt.count;
      best = bkt;
    }
  }

  if (!best) return null;
  return [
    Math.round(best.r / best.count),
    Math.round(best.g / best.count),
    Math.round(best.b / best.count),
  ];
}

/**
 * Auto-detect bgMode by sampling 16×16 patches from the four corners.
 * Returns "white" (median lightness > 0.94) or "pastel" otherwise.
 */
export async function detectBgMode(rawPath) {
  const sharp = await loadSharp();
  const { data, info } = await sharp(rawPath, { density: 300, limitInputPixels: false })
    .resize({ width: 400, height: 400, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const PATCH = 16;
  const corners = [
    [0, 0],
    [width - PATCH, 0],
    [0, height - PATCH],
    [width - PATCH, height - PATCH],
  ];

  const lightnesses = [];
  for (const [cx, cy] of corners) {
    for (let dy = 0; dy < PATCH; dy++) {
      for (let dx = 0; dx < PATCH; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const i = (y * width + x) * 4;
        if (data[i + 3] < 128) continue;
        const [, , l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        lightnesses.push(l);
      }
    }
  }

  if (lightnesses.length === 0) return 'pastel';

  lightnesses.sort((a, b) => a - b);
  const median = lightnesses[Math.floor(lightnesses.length / 2)];

  if (median > 0.94) return 'white';
  if (median >= 0.85) return 'pastel';
  console.warn(`[locators:detect] ${path.basename(rawPath)}: background median lightness ${median.toFixed(2)} — using "pastel" but manual review recommended`);
  return 'pastel';
}

export function commonsFilePathUrl(filename) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
}

export function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    throw new Error('Missing dependency "sharp". Run: npm install --prefix scripts');
  }
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function localeSort(a, b) {
  return a.localeCompare(b);
}
