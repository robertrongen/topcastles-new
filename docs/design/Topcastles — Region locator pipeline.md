# Topcastles — Region locator pipeline
## Fetch from Wikimedia + recolour to Topcastles palette

A two-script pipeline that produces a ready-to-ship locator PNG for every region in `regions.json`. Designed to be run once per region added to the catalogue (or in bulk on a fresh checkout).

```
   regions.json                    assets/locators/
        │                                ▲
        ▼                                │
  ┌──────────┐   ┌────────────┐   ┌────────────┐
  │ resolve  │──▶│ fetch PNG  │──▶│ recolour   │
  │ (Wiki)   │   │ (Commons)  │   │ (sharp)    │
  └──────────┘   └────────────┘   └────────────┘
        ▲              ▲                 ▲
   manifest.json   raw cache         palette spec
```

Three small pieces. Run them in order; each is idempotent.

---

## 0. Why this exists

The current page ships hand-drawn glyphs that look distinctive but **don't locate** the region for the reader. Everyone knows what France looks like; almost nobody knows where Apulia is on it. Wikimedia Commons has high-quality "locator map" PNGs for almost every NUTS-2 region, every UK historic county, every Italian region, every Spanish *comunidad autónoma* — under permissive licences and with a predictable URL pattern.

We pull those, recolour them to the Topcastles palette (ochre highlight, slate country mass, transparent background), and ship them as 320 × ~360 PNGs. One source of truth, one transform, one output directory.

---

## 1. The manifest

A flat JSON file that pins each region to its Wikimedia Commons file. Hand-curated once, machine-read forever. Keep it under version control.

`assets/locators/manifest.json`:

```json
{
  "middle-rhine":         { "commons": "Mittelrhein_in_Germany.svg",
                            "highlightHueRGB": [62, 116, 64],
                            "bgMode": "white" },
  "loire":                { "commons": "Centre-Val_de_Loire_in_France.svg",
                            "highlightHueRGB": [80, 110, 175],
                            "bgMode": "pastel" },
  "welsh-marches":        { "commons": "Wales_in_the_United_Kingdom.svg",
                            "highlightHueRGB": [50, 70, 178],
                            "bgMode": "white" },
  "castilian-frontier":   { "commons": "Localización_de_Castilla_y_León.svg",
                            "highlightHueRGB": [60, 80, 200],
                            "bgMode": "white" },
  "...": "..."
}
```

Per-region keys:
- `commons` — exact filename on Wikimedia Commons. Find via *commons.wikimedia.org/wiki/Category:Locator_maps_of_…*.
- `highlightHueRGB` — RGB sample of the saturated region colour in the source. Eyedropper from the original. The recolour script uses this to identify which pixels become ochre.
- `bgMode` — `"white"` (sharp white background, e.g. Wikipedia German *Bundesländer*) or `"pastel"` (off-white pastel, e.g. French *régions*). Drives the transparency cutoff.

If a region doesn't have a Wikimedia map, leave it out and fall back to the existing hand-drawn glyph for that one.

---

## 2. Fetch script — `scripts/fetch-locators.mjs`

Pulls each manifest entry from Commons into a raw cache. Uses the public Special:FilePath endpoint, which redirects to the latest version of the file and respects content-type negotiation.

```js
// scripts/fetch-locators.mjs
// Run: node scripts/fetch-locators.mjs
//
// Fetches each manifest entry into assets/locators/_raw/.
// Skips files already present unless --force is passed.

import fs from 'node:fs/promises';
import path from 'node:path';

const MANIFEST = JSON.parse(
  await fs.readFile('assets/locators/manifest.json', 'utf8')
);
const RAW_DIR = 'assets/locators/_raw';
const FORCE = process.argv.includes('--force');

await fs.mkdir(RAW_DIR, { recursive: true });

// Polite UA — Wikimedia requires a contact email on automated requests.
const UA = 'TopcastlesLocatorFetcher/1.0 (https://topcastles.example; ops@topcastles.example)';

for (const [id, entry] of Object.entries(MANIFEST)) {
  // pick extension from the Commons filename (.svg / .png / .jpg)
  const ext = path.extname(entry.commons).toLowerCase().slice(1);
  const dest = path.join(RAW_DIR, `${id}.${ext}`);

  if (!FORCE) {
    try { await fs.stat(dest); console.log(`✓ cached  ${id}`); continue; }
    catch {}
  }

  // Special:FilePath returns the file directly (302 → CDN).
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(entry.commons)}`;
  process.stdout.write(`↓ fetching ${id} … `);
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    console.log(`FAIL ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
  console.log(`${(buf.length/1024).toFixed(1)} KB`);

  // Be polite — 1 req/s.
  await new Promise(r => setTimeout(r, 1000));
}
```

Run:

```bash
node scripts/fetch-locators.mjs           # fetch missing only
node scripts/fetch-locators.mjs --force   # re-fetch everything
```

---

## 3. Recolour script — `scripts/build-locators.mjs`

Reads each raw cache file and writes the final palette-shifted PNG to `assets/locators/`. Uses [`sharp`](https://sharp.pixelplumbing.com/) for raster work and a tiny home-grown palette function — no other deps.

```js
// scripts/build-locators.mjs
// Run: node scripts/build-locators.mjs
//
// Reads assets/locators/_raw/*.{png,svg,jpg} and produces
// assets/locators/<id>.png — recoloured into the Topcastles palette.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MANIFEST = JSON.parse(
  await fs.readFile('assets/locators/manifest.json', 'utf8')
);
const RAW_DIR = 'assets/locators/_raw';
const OUT_DIR = 'assets/locators';

// Topcastles palette (Option A spec)
const OCHRE     = [201, 134, 63];   //  #C9863F  highlighted region
const NEIGHBOUR = [42,  53,  80];   //  #2a3550  country / sibling regions
const COAST     = [58,  66,  88];   //  #3a4258  borders & coastline
// background → fully transparent (alpha 0)

// Target output: 640×640 max, fit inside, preserve aspect.
const OUTPUT_MAX = 640;

for (const [id, entry] of Object.entries(MANIFEST)) {
  const raw = await findRaw(id);
  if (!raw) { console.warn(`× missing raw ${id}`); continue; }

  // Rasterise (SVG → PNG at 3× source size, then downsample for crispness)
  const buf = await sharp(raw, { density: 300 })
    .resize({ width: OUTPUT_MAX, height: OUTPUT_MAX, fit: 'inside', kernel: 'nearest' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = buf;
  const px = new Uint8ClampedArray(data);

  recolour(px, entry);

  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 }})
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, `${id}.png`));

  console.log(`✓ ${id}.png  ${info.width}×${info.height}`);
}

// ---- find raw file with any of the supported extensions ----
async function findRaw(id) {
  for (const ext of ['svg', 'png', 'jpg', 'jpeg']) {
    const p = path.join(RAW_DIR, `${id}.${ext}`);
    try { await fs.stat(p); return p; } catch {}
  }
  return null;
}

// ---- the recolour core ----
function recolour(px, entry) {
  const [hh] = rgbToHsl(...entry.highlightHueRGB);
  const bgMin   = entry.bgMode === 'pastel' ? 0.94 : 0.92;
  const dh      = entry.dh   ?? 0.08;
  const sMin    = entry.smin ?? 0.25;
  const lMax    = entry.lmax ?? 0.70;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i+1], b = px[i+2];
    const [h, s, l] = rgbToHsl(r, g, b);

    // 1. is this pixel the highlighted region?
    let dist = Math.abs(h - hh);
    if (dist > 0.5) dist = 1 - dist;
    if (s > sMin && dist < dh && l < lMax) {
      // tonal variation: darker source → darker ochre
      const k = 0.85 + 0.30 * (0.55 - l);
      px[i  ] = clamp(OCHRE[0] * k);
      px[i+1] = clamp(OCHRE[1] * k);
      px[i+2] = clamp(OCHRE[2] * k);
      continue;
    }
    // 2. background?
    if (l > bgMin) { px[i+3] = 0; continue; }
    // 3. dark stroke / coast?
    if (l < 0.22) { px[i] = COAST[0]; px[i+1] = COAST[1]; px[i+2] = COAST[2]; continue; }
    // 4. default: country mass / neighbour region
    const k = (l - 0.4);
    px[i  ] = Math.round(NEIGHBOUR[0] + k * 28);
    px[i+1] = Math.round(NEIGHBOUR[1] + k * 28);
    px[i+2] = Math.round(NEIGHBOUR[2] + k * 32);
  }
}

const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
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
```

Run:

```bash
npm i sharp
node scripts/build-locators.mjs
```

Outputs land in `assets/locators/middle-rhine.png` etc. — referenced from the React component as `<img src={`/assets/locators/${region.id}.png`} />`.

---

## 4. Drop-in usage in the React component

Replace the per-card glyph slot with a plain `<img>`. The transparent PNG sits cleanly on the dark card background; no extra wrapper styling needed.

```jsx
<div className="rc-locator">
  <img src={`/assets/locators/${region.id}.png`}
       alt={`${region.name} location map`}
       loading="lazy"
       width="320" height="auto" />
  <span className="rc-flag-tile">{region.cFlag}</span>
</div>
```

```css
.rc-locator{
  background: #0B101C;
  border: 1px solid #1d2434;
  aspect-ratio: 2 / 1.2;
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.rc-locator img{
  width: 78%;
  height: 88%;
  object-fit: contain;
  display: block;
  /* prevent the rasterised pixel art from looking jagged */
  image-rendering: -webkit-optimize-contrast;
}
.rc-flag-tile{
  position: absolute; top: 6px; left: 6px;
  width: 28px; height: 18px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(11,16,28,.86);
  border: 1px solid #2a3550;
  color: #C9B98F;
  font: 600 9.5px "JetBrains Mono", ui-monospace, monospace;
  letter-spacing: .06em;
}
```

---

## 5. Optional — vector route via Wikidata + GeoJSON

When you want infinitely-scalable SVG instead of crisp-but-raster PNG. Higher payoff, more work.

**Sketch:**

1. Look up the region's Wikidata Q-id (a column in `regions.json`).
2. SPARQL the Wikidata endpoint for the geoshape URL:
   ```sparql
   SELECT ?shape WHERE { wd:Q12345 wdt:P3896 ?shape }
   ```
   Returns a Commons URL like `http://commons.wikimedia.org/data/main/Data:France/Bourgogne.map`.
3. Fetch the `.map` file — it's a JSON wrapper around a GeoJSON `FeatureCollection`.
4. Same for the host country's outline (`P3896` on the country's Q-id).
5. Project both to the same SVG viewBox using a simple equirectangular or Mercator projection (a few lines of trig — no D3 needed for simple plates).
6. Render two `<path>` elements: `country` filled `#1d2434`, `region` filled `#C9863F`.

The output is a self-contained inline SVG you can drop straight into the React tree — no `<img>` round-trip.

```jsx
<svg viewBox="0 0 200 240">
  <path d={countryPath} fill="#1d2434" stroke="#3a4258" strokeWidth="0.6" />
  <path d={regionPath}  fill="#C9863F" />
</svg>
```

For ten regions this is feasible to do once and cache as static SVG strings. For hundreds, build it into a generation step alongside the recolour pipeline.

---

## 6. Licensing & attribution

Wikimedia locator maps are typically **CC-BY-SA 3.0** or **public domain**. Two obligations:

- **Attribute** the source map on a credits page (or per-region in the page footer if you prefer). The Commons file page lists the original author and licence; pull both into `manifest.json` as `credit` and `license` fields and render them in `/credits`.
- **Share-alike** for CC-BY-SA: our recoloured derivatives must be released under the same licence. Add a `LICENSE` note in `assets/locators/`.

Public-domain sources have no obligations but it's still good form to credit Wikimedia Commons.

---

## 7. Definition of done

- [ ] `manifest.json` covers every region currently in `regions.json` that has a Wikimedia locator (rest fall back to the existing hand-drawn glyph).
- [ ] `npm run locators:fetch` and `npm run locators:build` are wired in `package.json`.
- [ ] CI runs `build-locators` on every PR that touches `manifest.json`; PNGs are committed (small enough — ~10–20 KB each).
- [ ] `/credits` page lists the source + author + licence for every fetched map.
- [ ] The React `<RegionCard>` accepts `<img src=…>` as the locator and falls back to `<RegionGlyph id=…>` when the file is missing.
