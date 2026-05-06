# Region Locator Operator Instructions

Use this when you want to generate the new region locator images for
`new_app/public/images/maps/`. The scripts are designed to be safe to test in
small batches before doing the full run.

## What The Pipeline Does

The pipeline reads every unique `region_code` from
`new_app/public/api/castles.json`, keeps that exact code as the image filename,
and builds a manifest at:

```text
new_app/public/images/maps/manifest.json
```

For each configured manifest entry, it fetches the source locator from Wikimedia
Commons into a local raw cache:

```text
new_app/public/images/maps/_raw/
```

Then it recolours the locator into the Topcastles palette and writes:

```text
new_app/public/images/maps/<region_code>.dark.png
new_app/public/images/maps/<region_code>.light.png
```

The Angular Top Regions cards use CSS to pick the appropriate variant based on the user's color scheme preference:

```css
.rc-locator img {
  content: url("/images/maps/middle-rhine.dark.png");
}
@media (prefers-color-scheme: light) {
  .rc-locator img {
    content: url("/images/maps/middle-rhine.light.png");
  }
}
```

# Search all unresolved (takes a few minutes — ~197 × 600ms delay)
```bash
npm run locators:search -- --limit=20    # start with a small batch
```

# Review the candidates array in manifest.json for each region,
# set commons to the correct filename, then:
```bash
npm run locators:fetch
npm run locators:build
```
For a region with a parenthetical name like "Elzas (Alsace)", the script tries both Elzas and Alsace as search terms automatically. Use `--region=<code>` to re-run a single region, `--force` to refresh existing candidates.

## 1. Refresh The Manifest

Run:

```bash
npm run locators:inventory
```

This refreshes `manifest.json` from the current castle catalogue. It preserves
any fields you already curated, so it is safe to rerun after data changes.

Then validate the manifest:

```bash
npm run locators:check
```

The current scaffold is expected to say that all entries are unresolved until
you fill in Wikimedia details.

## 2. Curate A Few Entries First

Open:

```text
new_app/public/images/maps/manifest.json
```

For a small test, choose 2 or 3 regions and fill at least the `commons` field:

```json
{
  "commons": "Exact_Wikimedia_Commons_filename.svg",
  "highlightHueRGB": [80, 110, 175],
  "bgMode": "white",
  "credit": "Map author or Commons credit line",
  "license": "CC BY-SA 3.0",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:Exact_Wikimedia_Commons_filename.svg",
  "notes": "Optional reminder about how the highlight colour was sampled"
}
```

Required fields for fetching:

- `commons`: exact filename on Wikimedia Commons.

Required fields for building (can be filled after fetching):

- `highlightHueRGB`: RGB colour sampled from the highlighted region in the
  source locator image.
- `bgMode`: usually `white`; use `pastel` only when the source has a light
  pastel background that should become transparent.

Recommended fields before committing final generated images:

- `credit`
- `license`
- `sourceUrl`

## 3. Small No-Download Test

After curating a few rows with `commons`, run:

```bash
npm run locators:check
npm run locators:fetch -- --dry-run --limit=3
```

The dry run should list only configured entries and should not download files.

## 4. Fetch A Small Batch

Wikimedia asks automated clients to send a User-Agent with contact information.
In PowerShell:

```powershell
$env:WIKIMEDIA_USER_AGENT='TopcastlesLocatorFetcher/1.0 (https://topcastles.eu; robert@donron.eu)'
```

Then fetch a small batch:

```bash
npm run locators:fetch -- --limit=3
```

Raw files will appear under:

```text
new_app/public/images/maps/_raw/
```

The raw cache is ignored by Git and should not be committed.

After fetching, open the raw images and sample the highlight color for each region to fill `highlightHueRGB`.

## 5. Build The PNGs

After filling `highlightHueRGB` for the fetched entries, run:

```bash
npm run locators:build
```

This writes configured locator images to:

```text
new_app/public/images/maps/<region_code>.dark.png
new_app/public/images/maps/<region_code>.light.png
```

Review those PNGs visually. If a highlight is wrong, adjust
`highlightHueRGB`, rerun `npm run locators:build`, and compare again.

## 6. Full Run

Once the small batch looks right:

```bash
npm run locators:check
npm run locators:fetch
npm run locators:build
```

Commit:

- `new_app/public/images/maps/manifest.json`
- generated `new_app/public/images/maps/*.dark.png`
- generated `new_app/public/images/maps/*.light.png`
- `new_app/public/images/maps/LICENSE.locators.md`

Do not commit:

- `new_app/public/images/maps/_raw/*`

## 7. Final Verification

Run:

```bash
npm run locators:test
npm run locators:check
npx --prefix new_app ng test --watch=false --browsers=ChromeHeadless --include=src/app/pages/top-regions/top-regions-page.component.spec.ts
npm run build
git diff --check
```

Expected current caveat: `npm run build` may warn that the initial bundle is a
few kilobytes over the existing budget. That warning predates the locator image
pipeline and does not block the locator workflow.
