# Claude Code prompt — fix and harden the region locator pipeline

Paste the block below into Claude Code as a single task. It assumes the repo already contains the scripts under `scripts/` (`region-locators.mjs`, `build-locators.mjs`, `fetch-locators.mjs`, `check-region-locators.mjs`, `prepare-region-locator-manifest.mjs`, `region-locators.test.mjs`) and the manifest at `new_app/public/images/maps/manifest.json`. If any of those paths differ in your tree, adjust the file references in the prompt before sending.

---

## The prompt

You are working on the **Topcastles region locator pipeline**. It fetches Wikimedia Commons locator maps for each `region_code` in `new_app/public/api/castles.json` and recolours them into the Topcastles palette (ochre highlight, slate or parchment country mass, transparent background) for use in the Top Regions cards. Two palettes are emitted per region: `<region_code>.dark.png` and `<region_code>.light.png`, into `new_app/public/images/maps/`.

The pipeline currently produces correct output for some regions (e.g. `algarve`) but fails on others in two predictable ways:

1. **Inverted output** — the country mass renders as the highlight and the actual region renders as background. Root cause: the manually-supplied `highlightHueRGB` in `manifest.json` does not match the real highlight colour in the source SVG/PNG, so the recolour function classifies the wrong pixel cluster as the highlight. Example failing region: `abruzzi`.
2. **Pale-background bleed in light mode** — the source's neighbour fill is so light that the `bgMin` threshold cuts it as background, leaving only thin sliver-borders. Visible only in `.light.png` because the dark slate hides the issue. Root cause: the manifest's `bgMode` is set to `white` when the actual source background is `pastel`. Example failing region: `achaia`.

There is also a latent **confetti bug**: when a source contains small markers (city dots) in the same hue as the highlight, those pixels recolour to ochre and scatter across the country mass. Not currently visible after the latest tweak, but the algorithm is still vulnerable — confirmed in earlier runs of `abruzzi`.

### Your job

Make the pipeline self-correcting so operators do not have to eyedropper colours or guess `bgMode`. Then prove the failures listed above are fixed, and that the previously-correct regions still work.

### Concrete tasks

**1. Add `detectHighlightHue(rawPath)` to `scripts/region-locators.mjs`.**

It should rasterise the raw source (SVG via sharp at `density: 300`, PNGs/JPGs as-is), bucket fully-opaque pixels by hue (24 buckets × 15°), filter to saturation > 0.30 and lightness in [0.20, 0.65], and return the average RGB of the largest bucket whose share of considered pixels is between 0.5% and 50%. The "minority" upper bound is essential — it excludes the country mass when the country mass is itself saturated (e.g. saturated mid-blue Italy in the Abruzzo source).

Return `null` when no qualifying bucket exists, so the build step can warn loudly instead of silently producing garbage.

**2. Add `detectBgMode(rawPath)` to `scripts/region-locators.mjs`.**

Sample 16×16 px patches from each of the four corners of the rasterised source, compute median HSL lightness across all sampled pixels, and return `"white"` for median > 0.94, `"pastel"` for 0.85–0.94, and `"pastel"` (with a `console.warn`) for < 0.85 — those sources need manual review, but `pastel` is the safer default than `white`.

**3. Wire both detectors into `scripts/build-locators.mjs`.**

Before calling `recolourLocatorPixels`, build an `effectiveEntry`:

- If `entry.highlightHueRGB` is missing or `entry.autoDetectHue === true`, call `detectHighlightHue` and use the result. If it returns `null`, log a warning, skip the region, do not fail the whole build.
- If `entry.bgMode` is missing or `entry.autoDetectBgMode === true`, call `detectBgMode`.
- Log the auto-detected values: `[locators:build] abruzzi auto-detected highlight = [210, 100, 60], bgMode = white`. The operator can use these logs to backfill the manifest if they want explicit values.

**4. Relax `isConfigured` in `scripts/region-locators.mjs`.**

A configured entry now requires only `commons`. `highlightHueRGB` and `bgMode` become optional and auto-detected. Keep the validation in `validateManifest` for *explicitly-supplied* values (still must be `[0..255]×3` and `"white" | "pastel"` respectively); just stop requiring them.

Update `scripts/check-region-locators.mjs` and `scripts/region-locators.test.mjs` accordingly so `npm run locators:check` and `npm run locators:test` still pass with the relaxed contract.

**5. Add a connected-component filter to `recolourLocatorPixels`.**

After the per-pixel hue classification but before the palette write, if `entry.filterConfetti !== false` (default on), find connected components of highlight-marked pixels using a stack-based flood fill (4-connectivity is fine). Drop any component whose pixel count is below `max(0.005 × totalHighlightPixels, 25)`. Demoted pixels fall through to the "country mass" branch.

Make sure this runs once per build, not once per palette — compute the highlight mask, run the filter, then apply the two palettes against the same filtered mask. (Currently the recolour function is called twice, once per palette; you'll need to factor the classification step out so the mask is shared. Land this as a small refactor: `classifyPixels(px, entry) → mask`, then `paint(px, mask, palette)`.)

**6. Add fetch validation to `scripts/fetch-locators.mjs`.**

After writing each file: assert size ≥ 5 KB and (using sharp's `metadata()`) width ≥ 200 px and height ≥ 200 px. Warn loudly on failure. Do not delete the file — the operator may want to inspect it — but log a clear `[locators:fetch] WARN <region_code>: file looks like a thumbnail or error page (1.2 KB, 80×60)`.

**7. Fix the two known-bad manifest entries.**

For `abruzzi` and `achaia` specifically:

- Open `_raw/abruzzi.*` and `_raw/achaia.*`. If either is missing, run `npm run locators:fetch -- --limit=999` first.
- Run a one-off invocation of `detectHighlightHue` and `detectBgMode` against each file and record the output in the manifest as the new `highlightHueRGB` and `bgMode`.
- For `achaia`, also verify that the file at `_raw/achaia.*` is genuinely a locator map of the Achaea regional unit (not Aetolia-Acarnania or another region of Central Greece). If the wrong file was fetched, search Wikimedia Commons for the correct file (`2011_Greece_PE_Achaia.svg` or `Achaea_within_Greece.svg` are likely candidates), update `manifest.json`'s `commons` field, refetch, and rebuild.
- Commit the updated `manifest.json`.

### Verification — must all pass before you finish

Run, in order:

```bash
npm run locators:check
npm run locators:test
npm run locators:fetch -- --limit=999
npm run locators:build
```

Then **inspect the produced PNGs** — do not rely on the build step exiting 0. For each of `algarve`, `abruzzi`, `achaia`, and any two other configured regions of your choice, open both `<id>.dark.png` and `<id>.light.png` and confirm:

- The highlighted region is the **correct** region (cross-reference against Wikipedia's locator map for that region).
- The highlight is ochre `#C9863F` ± tonal variation.
- The country mass is filled (slate in dark, parchment in light) — not transparent, not the same colour as the highlight.
- The background outside the country is fully transparent.
- No confetti / orphan dots.
- Borders are visible (slate-on-darker-slate in dark mode; ochre-grey on parchment in light mode).

Then run the Angular spec for the Top Regions page to confirm consumers still work:

```bash
npx --prefix new_app ng test --watch=false --browsers=ChromeHeadless --include=src/app/pages/top-regions/top-regions-page.component.spec.ts
npm run build
git diff --check
```

The bundle-size warning on `npm run build` is pre-existing and acceptable.

### Output

Write a short PR-ready summary that lists:

- Which manifest entries had their `highlightHueRGB` / `bgMode` auto-detected for the first time, and what values were detected.
- Which entries you had to manually correct (e.g. `achaia` fetching the wrong file).
- The before/after of any region whose output changed.
- A one-line note for any region you could not fix (e.g. raw fetch returned a 404 or a thumbnail).

Do not commit anything under `new_app/public/images/maps/_raw/` — that directory is gitignored. Do commit the updated `manifest.json`, the regenerated PNGs, and the modified scripts and tests.

---

## Notes for the human running this

- The prompt assumes Claude Code has filesystem access to the repo and can run `npm` scripts. If your setup runs the agent in a sandbox without network egress, run `npm run locators:fetch -- --limit=999` once yourself before handing off, so the `_raw/` cache is populated.
- The `detectHighlightHue` heuristic ("largest saturated bucket below 50% share") is right for the maps Topcastles uses, but it is a heuristic. If a region comes out wrong after auto-detect, the operator can override by setting `highlightHueRGB` explicitly in the manifest — the build step already prefers the explicit value. Document this in the operator instructions as the escape hatch.
- The connected-component filter has one false-positive risk: very small island regions (e.g. a single Greek island that *is* the entire highlight) could fall under the 25-pixel floor. The 0.005-of-total floor is the primary check; the 25 is a defensive minimum. If a future region trips this, expose `filterConfetti: false` per-entry as the override.
