# Claude Code prompt — implement Option A (Top Regions: locator maps + sort parity)

Paste the block below into Claude Code as a single task. Adjust the Angular paths if your tree differs (the prompt assumes `new_app/` is the Angular app and the locator pipeline lives under `scripts/` per the existing operator instructions).

---

## The prompt

You are implementing **Option A** of the Topcastles "Top regions" page revision. The goal is to bring the live page up to parity with the design proposal in `Topcastles Top Regions.html` (Design Canvas, section "Option A — Atlas cards with locator maps"). Two concrete changes:

1. **Replace the abstract glyph in each region card with a country-silhouette locator map** — a transparent-background PNG produced by the region-locator pipeline (`scripts/build-locators.mjs`), in two palettes: dark (`<id>.dark.png`) and light (`<id>.light.png`). The page already has light/dark theming; the correct palette is selected per theme.
2. **Add a sort strip** identical to the one on the Top countries page — five modes: ★ Editorial, Visitor, Mean score, Total entries, By disagreement. Sorting reorders cards in place, no page reload.

Everything else about the existing card grid stays: same dual rank (★ ed / vis with ↑↓ arrow), same EDITOR'S SLEEPER flag, same editor's-note prose, same grid layout, same Top regions section header.

### Repo orientation

- **Angular page:** `new_app/src/app/pages/top-regions/top-regions-page.component.{ts,html,scss}` and its spec.
- **Locator data source:** `new_app/public/api/castles.json` (the existing source of truth for `region_code` values). The locator pipeline already builds from this.
- **Locator images:** `new_app/public/images/maps/<region_code>.{dark,light}.png` — produced by `npm run locators:build`. Some entries are still unresolved; missing images must fall back to the existing legacy JPG (current behaviour) or, failing that, a CSS-drawn placeholder.
- **Sort strip reference implementation:** look at the Top countries page component (`new_app/src/app/pages/top-countries/...`). The sort modes, button styling, keyboard handling, and "Editorial ranks revised quarterly · last revision Q1 2026" meta line are already there — copy the pattern, do not reinvent.
- **Design source of truth:** `Topcastles Top Regions.html` and its companion JSX (`topregions-options.jsx`, `topregions-locators.jsx`). The function `RegionsAtlasV2` is the target visual; replicate its DOM structure and CSS tokens in Angular components.

### Concrete tasks

**1. Top regions component — markup and styles**

- Lift the `region-card` / `rc-head` / `rc-glyph` / `rc-locator` / `rc-name` / `rc-where` / `rc-flag` / `rc-note` / `rc-meta` markup and styles from `Topcastles Top Regions.html` into the Angular component.
- Card grid: 4 columns at desktop, 2 at tablet (~768 px), 1 at mobile. Use CSS Grid with `repeat(auto-fill, minmax(300px, 1fr))` if the Top countries page uses that pattern; otherwise mirror its breakpoints exactly.
- The locator slot replaces the current abstract glyph wrapper. Aspect ratio `2 / 1.2`, background `#0B101C` in dark mode and `#F4EFE3` (parchment) in light, single 1 px border. The image fills 88 % × 88 % `object-fit: contain` with `image-rendering: -webkit-optimize-contrast` so the rasterised output stays crisp.
- Top-left flag tile (28 × 18 px, dark backplate, mono caps country code) overlays the locator at `top: 6px; left: 6px` with `position: absolute`.

**2. Locator image component — `<region-locator>` (or equivalent Angular directive)**

Inputs:
- `regionCode: string` — required.
- `regionName: string` — required, becomes the `alt` text (`"<name> location map"`).
- `theme?: 'dark' | 'light'` — optional override; defaults to the current page theme.

Behaviour:
- Renders `<img src="/images/maps/{{regionCode}}.{{theme}}.png" alt="…" loading="lazy">`.
- On `error`, falls back in this order: legacy JPG (`/images/maps/{{regionCode}}.jpg`) → CSS placeholder (a slate `#1d2434` rectangle with a small ochre `?` glyph, 32 × 32 px centred). Do not fall back to the abstract SVG glyph — that experiment is closed.
- The `theme` input must be reactive: when the user toggles light/dark, the `<img>` switches sources without a flash. If your theme service emits an Observable, bind `[src]` to a derived signal/observable; do not force a full component re-render.

Add a unit spec covering the three rendering paths (PNG present, legacy JPG fallback, placeholder).

**3. Sort strip + sort state**

- Reuse the Top countries page's sort-strip component verbatim — same component, same CSS, same five modes. If it isn't already extracted into a shared component, extract it to `new_app/src/app/shared/sort-strip/` as part of this work and have both pages import it.
- Default sort: `ed` (Editorial). Persist the user's choice in the route's query string (`?sort=mean`) so deep-linking and back-button work — exactly how Top countries does it.
- Sort modes:
  - `ed` → ascending by editorial rank
  - `vis` → ascending by visitor rank
  - `mean` → descending by mean score
  - `entries` → descending by total entries
  - `diff` → descending by `|vis − ed|`

  These match the Top countries implementation. Lift the comparator functions into a `regionSort` utility that the component imports.

**4. Card body**

Reproduce the proposal's card body in this order, top-to-bottom:

1. **Header row.** Left: `№ NN` index in mono, derived from current sort position. Right: `★ <ed>` in serif ochre + `<arrow> <vis>` in Inter, where the arrow is `↑` if `vis < ed` (visitor rates higher), `↓` if `vis > ed` (editor rates higher), nothing if equal. Visitor number tinted green-ish (`#7BA77A`) for `↑`, rust (`#A87968`) for `↓`.
2. **Locator slot** (described above).
3. **Region name** in serif 18 px.
4. **Where line** — `<host country code> · <em>{span}</em>` in serif 12 px.
5. **EDITOR'S SLEEPER** flag — only when `flag === 'editorial-sleeper'`. Solid ochre `#C9863F` background, dark text, mono caps, 9.5 px.
6. **Note** — italic serif 13 px, ochre-paper `#C5C0AF`, `text-wrap: pretty`. This element is `flex: 1` so the meta row pins to the bottom regardless of note length.
7. **Meta row** — `<entries> entries · <mean> mean · OPEN §`. Top border `1 px #1d2434`. Numbers tabular-num. "OPEN §" is a link to the region's detail page (use the routerLink pattern the rest of the app uses).

**5. Sleeper-card styling**

Cards with `flag === 'editorial-sleeper'` get an ochre border `#C9863F` and a faint inset glow `inset 0 0 0 1px rgba(201,134,63,.15)`. Pure CSS class, no JS branching beyond the conditional class.

**6. Section subtitle**

Replace the existing subtitle prose with the version from the proposal:

> Where countries are political, regions are *architectural*. Our editorial board maintains a parallel index of cross-border and sub-national regions where a single building tradition reaches its high point. **Each card opens with a locator** showing where the region sits in its country.

The "**Each card opens with a locator**" emphasis is set in ochre `#C9863F`.

**7. Top countries parity audit**

Before you finish, open the Top countries page side-by-side with the new Top regions page in both dark and light mode. The sort strip, the rank pair (`★ ed` / `arrow vis`), the SLEEPER tag, the legend, the section header chrome, the "All regions ▸" / "All countries ▸" link in the section header, and the meta line ("Editorial ranks revised quarterly · last revision Q1 2026") **must look identical between the two pages**. Any drift is a bug — fix it on the side that is wrong, with a preference to fix the regions page (Top countries is the established baseline).

### Verification — must all pass before you finish

```bash
npm run locators:check
npm run locators:build
npx --prefix new_app ng test --watch=false --browsers=ChromeHeadless --include=src/app/pages/top-regions/**/*.spec.ts
npx --prefix new_app ng test --watch=false --browsers=ChromeHeadless --include=src/app/shared/sort-strip/**/*.spec.ts
npm run build
```

Then **inspect the live page** at `/top-regions`:

1. Card grid renders with one card per unique `region_code` in `castles.json`.
2. For at least the regions whose locator images are committed (algarve, abruzzi, achaia at minimum, plus any others present in `manifest.json`), the locator image renders, transparent background sits cleanly on the card chrome, and the highlight visibly identifies the region.
3. For region codes without a generated PNG, the legacy JPG renders. For codes without either, the placeholder shows.
4. Toggle light/dark — every locator switches to the correct palette without a flash; no card chrome shows the wrong-theme image even briefly.
5. Click each sort mode in turn. Cards reorder in place (no page reload, no scroll jump). The URL updates to `?sort=<mode>`. Reload — sort persists.
6. Resize from desktop → tablet → mobile. Grid reflows to 4 / 2 / 1 columns. No horizontal scroll, no clipped flag tile, no clipped sleeper border.
7. Open the Top countries page and the Top regions page side by side. Sort strip pixel-identical. Section header pixel-identical. Sleeper tag pixel-identical.

### Definition of done

- New components (`<region-locator>` and the lifted `<sort-strip>` if extracted) have unit specs covering the documented behaviour.
- The Top regions page component spec covers: card count matches `region_code` cardinality; default sort is editorial; sort change updates the URL; sleeper styling toggles on the right rows.
- No regressions in the Top countries page (its own spec still passes; visual parity confirmed).
- `git diff --check` clean.
- The bundle-size warning is acceptable (pre-existing).

### Output

Write a short PR-ready summary listing:

- Components added or extracted (with paths).
- The sort comparator utility's location.
- How many region cards render generated PNG vs legacy JPG vs placeholder, broken down by region code.
- Any deviations from the proposal mockup (e.g. typography substitutions if the design's exact serif isn't loaded in Angular yet) and why.
- A screenshot of the new page in both themes attached to the PR.

Do not change any locator-pipeline code in this PR. If the pipeline produces a wrong image for a region, file a follow-up issue and accept the legacy-JPG fallback for that region in the meantime.

---

## Notes for the human running this

- The proposal mockup deliberately demos only three regions with real PNGs (algarve, abruzzi, achaia) because those are the test images that exist today. The Angular implementation should not hard-code that subset — it should attempt the PNG for every region and gracefully fall back when the file 404s. As more regions get curated in `manifest.json` and rebuilt, they light up automatically.
- If the Top countries sort strip is not yet a shared component, extracting it is part of this PR. The two pages must share the implementation; copy-paste drift is the failure mode this prevents.
- The placeholder fallback (slate rectangle with an ochre `?`) is the third tier and should be rare. If it shows up on more than ~20 % of cards, stop and curate more `manifest.json` entries before merging — the page should not look like swiss cheese.
