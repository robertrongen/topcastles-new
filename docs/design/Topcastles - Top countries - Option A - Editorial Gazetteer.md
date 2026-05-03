# Topcastles — Top countries (Option A: Editorial Gazetteer)
## Implementation style guide for Claude Code

**Scope.** Replace the existing "Top countries" block on the homepage (and the dedicated `/countries` page if it shares the same component) with the *Editorial Gazetteer* layout: a flat dual-rank table with an editor's-note column and an "Editor's sleeper" flag for entries where editorial judgement and visitor traffic disagree most.

**Reference mockup.** `Topcastles Top Countries.html`, artboard "A · Gazetteer table — dual rank + editor's note".

**Pairs with.** `Topcastles Masthead Refresh — Option A` and `Topcastles Featured Hero — Option A`. Same token set; do not introduce new colors or font families.

---

## 1. Anatomy

```
┌──────────── section header (serif, 2 px ochre rule) ────────────────────────┐
│ Top countries                                  By editorial rank ▸          │
│ Two parallel rankings of the catalogue's …                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Sort  [Editorial] [Visitor] [By disagreement]   Last revised  Q1 2026       │
├──────────────────────────────────────────────────────────────────────────────┤
│ #   Flag  Country     ★Ed. Vis. Entries Mean  Tradition       Editor's note │
│ 1   FR    France       1   2    1,802   4.42  Renaissance…    The deepest…  │
│ 2   DE    Germany      2   1↑   1,406   4.46  Late medieval…  Density unm…  │
│ …                                                                            │
│ 12  SY    Syria       12   31↓     46   4.62  Crusader concs. EDITOR'S      │
│                                                                SLEEPER       │
│                                                                Tiny entry…   │
├──────────────────────────────────────────────────────────────────────────────┤
│  ★ Editorial · ↑ visitors higher · ↓ editors higher · EDITOR'S SLEEPER       │
└──────────────────────────────────────────────────────────────────────────────┘
```

A single dense table. Two parallel rank columns are the entire conceptual point — never collapse to one.

---

## 2. Tokens (reuse Option A palette)

These already exist from the masthead and featured-hero specs. Do not redefine.

```css
/* dark mode */
--ink-bg:        #0E1320;
--ink-bg-2:      #0B101C;
--ink-card:      #141B2C;
--ink-line:      #1d2434;
--ink-line-2:    #2a3550;
--text-1:        #F2EAD3;
--text-2:        #E8E2D2;
--text-3:        #C5C0AF;
--text-4:        #9AA8BD;
--text-5:        #7A8AA0;
--text-6:        #5e6a82;
--ochre:         #C9863F;
--ochre-soft:    #C9B98F;

/* new — semantic delta colors. Add these once, reuse across the catalogue. */
--delta-up:      #7BA77A;   /* visitors rank higher than editors (sage green) */
--delta-down:    #A87968;   /* editors rank higher than visitors (terracotta) */
```

The two delta colors are deliberately *muted* — sage and terracotta, not green and red. The page is a reference work, not a stock ticker.

Light mode mirrors with the cream tokens; the only swap is `--delta-up: #4f7a55; --delta-down: #8a4a3a;`.

---

## 3. Typography

| Element | Family | Weight | Size | Line | Tracking | Color |
|---|---|---|---|---|---|---|
| Section head ("Top countries") | Source Serif 4 | 600 | 22 px | 1.2 | -.005em | `--text-1` |
| Section head right link ("By editorial rank ▸") | Inter | 500 | 11 px | 1 | .08em UC | `--ochre` |
| Section sub | Source Serif 4 *italic* | 400 | 13.5 px | 1.5 | 0 | `--text-4` |
| Sort-strip "Sort" label | Inter | 600 | 10.5 px | 1 | .1em UC | `--text-5` |
| Sort-strip button (off) | Inter | 400 | 11.5 px | 1 | 0 | `--text-4` |
| Sort-strip button (on) | Inter | 600 | 11.5 px | 1 | 0 | `#0E1320` on `--ochre` |
| Sort-strip "Last revised" meta | Inter | 400 | 11 px | 1 | 0 | `--text-5` (bold value `--ochre-soft`) |
| Table column head (TH) | Inter | 600 | 10 px | 1 | .09em UC | `--text-5` |
| Row index (#) | Inter | 400 | 12 px | — | 0 | `--text-5` |
| Flag tile glyph | JetBrains Mono | 600 | 10 px | 1 | .06em | `--ochre-soft` |
| Country name link | Source Serif 4 | 600 | 14.5 px | 1.3 | 0 | `--text-1` (hover `--ochre`) |
| Editorial rank cell | Source Serif 4 | 600 | 14 px | 1 | tabular | `--ochre` |
| — star prefix | Source Serif 4 | 600 | 14 px | — | — | `--ochre` |
| Visitor rank cell — neutral | Inter | 400 | 13 px | 1 | tabular | `--text-4` |
| Visitor rank cell — higher (↑) | Inter | 500 | 13 px | — | tabular | `--delta-up` |
| Visitor rank cell — lower (↓) | Inter | 500 | 13 px | — | tabular | `--delta-down` |
| Entries / Mean cells | Source Serif 4 | 600 | 13 px | — | tabular | `--text-1` |
| Defining-tradition cell | Source Serif 4 *italic* | 400 | 13 px | 1.4 | 0 | `--text-4` |
| Editor's note cell | Source Serif 4 | 400 | 13 px | 1.5 | 0 | `--text-3` |
| EDITOR'S SLEEPER tag | Inter | 600 | 9.5 px | 1 | .1em UC | `#0E1320` on `--ochre` |
| Top entry cell | Source Serif 4 *italic* | 400 | 13 px | 1.4 | 0 | `--ochre-soft` (hover `--ochre`) |
| Legend strip | Inter | 400 | 11 px | 1.4 | 0 | `--text-5` |

UC = uppercase. Italics stylistic — never oblique.

---

## 4. Section header & section sub

Identical treatment to the Featured Hero spec — 2 px solid `--ochre` underline, `padding-bottom: 6px`, with the right-side link in `--ochre` uppercase. The right link **must point to a real destination** — for this section, the dedicated `/countries` page (full ranking, all 50+ countries, filters). Do not link to `/top-1000` or to anything that duplicates other nav. If the destination doesn't exist, omit the right-side link rather than ship a duplicate.

The section sub is a single italic paragraph. Reference copy:

> Two parallel rankings of the catalogue's best-represented countries: the **editorial rank** reflects depth and significance as judged by our editorial board; the **visitor rank** is the aggregate of recorded visits. Where they disagree, the disagreement is itself instructive.

The two rank-name spans inside should be in italic ochre (`color: var(--ochre); font-style: italic;`) so the user immediately reads them as the table's two axes.

---

## 5. Sort strip

A single horizontal row above the table. Three mutually-exclusive segmented buttons + a right-aligned "last revised" meta line.

```html
<div class="sort-strip">
  <span class="lbl">Sort</span>
  <button data-sort="ed" class="on">Editorial</button>
  <button data-sort="vis">Visitor</button>
  <button data-sort="diff">By disagreement</button>
  <span class="meta">Editorial ranks revised quarterly · last revision <b>Q1 2026</b></span>
</div>
```

```css
.sort-strip{
  display: flex; align-items: center; gap: 8px;
  padding: 0 0 12px;
  font: 11.5px/1 "Inter", system-ui, sans-serif;
}
.sort-strip .lbl{
  margin-right: 4px;
  font: 600 10.5px "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--text-5);
}
.sort-strip button{
  background: transparent;
  border: 1px solid var(--ink-line-2);
  color: var(--text-4);
  font: inherit;
  padding: 4px 12px;
  cursor: pointer;
  transition: color .12s, background .12s, border-color .12s;
}
.sort-strip button:hover{ color: var(--text-1); border-color: var(--ochre-soft); }
.sort-strip button.on{
  background: var(--ochre);
  border-color: var(--ochre);
  color: var(--ink-bg);
  font-weight: 600;
}
.sort-strip .meta{
  margin-left: auto;
  color: var(--text-5);
  font-size: 11px;
}
.sort-strip .meta b{ color: var(--ochre-soft); font-weight: 600; }
```

**By disagreement** sort = `Math.abs(visitor_rank - editorial_rank)` descending. This is the option that earns the layout — surface it at parity with the other two, never hide it behind a "more sorts" menu.

The "last revised" stamp is part of the editorial credibility play. It must reflect the actual data revision, not the page deploy date.

---

## 6. The table

```html
<table class="gazetteer">
  <thead>
    <tr>
      <th class="num"></th>           <!-- index -->
      <th></th>                       <!-- flag tile -->
      <th>Country</th>
      <th class="rk">★ Ed.</th>
      <th class="rk">Vis.</th>
      <th class="num">Entries</th>
      <th class="num">Mean</th>
      <th>Defining tradition</th>
      <th class="ed-note-h">Editor's note</th>
      <th class="num">Top entry</th>
    </tr>
  </thead>
  <tbody>
    <tr class="flagged"><!-- if editorial-sleeper -->
      <td class="num idx">12</td>
      <td class="flag-cell"><span class="flag-tile">SY</span></td>
      <td class="country"><a href="/countries/syria">Syria</a></td>
      <td class="ed"><span class="star">★</span>12</td>
      <td class="vis lower">31<span class="micro-arrow">↓</span></td>
      <td class="num">46</td>
      <td class="num mean">4.62</td>
      <td class="era">Crusader concentric</td>
      <td class="ed-note">
        <span class="sleeper-tag">EDITOR'S SLEEPER</span>
        <span class="note-body">Tiny entry count; outrageously high editorial rank. The fabric is decisive.</span>
      </td>
      <td class="top"><a>Krak des Chevaliers</a></td>
    </tr>
    …
  </tbody>
</table>
```

```css
table.gazetteer{
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 13px;
}
table.gazetteer thead th{
  text-align: left;
  font: 600 10px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: var(--text-5);
  padding: 8px 10px;
  border-bottom: 1px solid var(--ink-line-2);
  white-space: nowrap;
}
table.gazetteer thead th.num,
table.gazetteer tbody td.num{
  text-align: right;
  font-variant-numeric: tabular-nums;
}
table.gazetteer thead th.rk{ text-align: right; }
table.gazetteer thead th.ed-note-h{ width: 360px; }

table.gazetteer tbody td{
  padding: 10px;
  border-bottom: 1px solid var(--ink-line);
  color: var(--text-3);
  vertical-align: top;
}
table.gazetteer tbody tr:hover td{ background: var(--ink-card); }

/* the sleeper highlight is *the* editorial signal — keep it diffuse, not bright */
table.gazetteer tbody tr.flagged{
  background: linear-gradient(90deg, rgba(201,134,63,.05), transparent 70%);
}
table.gazetteer tbody tr.flagged:hover td{
  background: linear-gradient(90deg, rgba(201,134,63,.10), var(--ink-card) 70%);
}

td.idx{ color: var(--text-5); width: 26px; font-size: 12px; }
td.flag-cell{ width: 44px; padding: 8px 0 8px 6px; }
.flag-tile{
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 22px;
  background: var(--ink-line); border: 1px solid var(--ink-line-2);
  color: var(--ochre-soft);
  font: 600 10px "JetBrains Mono", ui-monospace, monospace;
  letter-spacing: .06em;
}
td.country a{
  font: 600 14.5px "Source Serif 4", serif;
  color: var(--text-1); text-decoration: none; cursor: pointer;
}
td.country a:hover{ color: var(--ochre); }

/* ─── the dual rank columns ─── */
td.ed{
  text-align: right;
  font: 600 14px "Source Serif 4", serif;
  font-variant-numeric: tabular-nums;
  color: var(--ochre);
  width: 56px;
}
td.ed .star{ margin-right: 4px; }
td.vis{
  text-align: right;
  font: 400 13px "Inter", system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  color: var(--text-4);
  width: 56px;
}
td.vis.higher{ color: var(--delta-up); font-weight: 500; }
td.vis.lower{ color: var(--delta-down); font-weight: 500; }
td.vis .micro-arrow{ font-size: 10px; margin-left: 2px; opacity: .85; }

td.num.mean{ font: 600 13px "Source Serif 4", serif; color: var(--text-1); }

td.era{
  font: italic 400 13px "Source Serif 4", serif;
  color: var(--text-4);
}
td.ed-note{
  font: 400 13px/1.5 "Source Serif 4", serif;
  color: var(--text-3);
}
td.ed-note .note-body{ display: block; }

.sleeper-tag{
  display: inline-block;
  font: 600 9.5px "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--ink-bg); background: var(--ochre);
  padding: 2px 6px;
  margin-bottom: 4px;
}

td.top a{
  font: italic 400 13px "Source Serif 4", serif;
  color: var(--ochre-soft);
  text-decoration: none; cursor: pointer;
}
td.top a:hover{ color: var(--ochre); }
```

### Critical details for the table

1. **Star + Roman is reserved for *editorial rank only*.** The country list uses Arabic in both rank columns (1, 2, 3 …); Roman numerals appear only on individual entry editorial ranks (★ XXIX/1000) per the Featured Hero spec. Do not use Roman numerals here.
2. **The arrow is part of the value, not a separate column.** It sits inside `td.vis` so it never wraps to the next line and never confuses screen readers — pair it with an `aria-label` (see §10).
3. **Don't add row striping.** The dotted bottom borders + sleeper gradient are the only horizontal articulation. Striping conflicts with the sleeper highlight.
4. **The "Defining tradition" column is short, italic prose** — never a tag list, never icons. If a country needs more than 4 words, edit; don't truncate.
5. **The sleeper tag goes inside the editor's-note cell, on its own line above the note.** It is part of the editorial voice, not a status badge floating on the row.

---

## 7. The "EDITOR'S SLEEPER" rule

A row is `flagged="editorial-sleeper"` (and gets the diffuse ochre row gradient + the inline tag in the editor's-note cell) when **`visitor_rank - editorial_rank >= 15`** OR the editorial board has manually set the flag in the data.

The threshold (15) is deliberately loose — it should catch ~5–10% of the visible list, not 30%. Recalculate on every editorial rank revision (quarterly).

If the data layer doesn't yet expose this, hand-flag the most editorially distinctive entries until it does. **Better to have one sleeper than zero**; the page reads as a flat ranking without it.

Manual flag wins over computed: a country can be marked `editorial-aligned` to suppress the auto-flag if the gap is mechanical (e.g. sample-size artefacts).

---

## 8. Legend strip (footer of the table)

```html
<div class="legend">
  <span><b class="star">★</b> Editorial rank — by the editorial board</span>
  <span class="dot">·</span>
  <span><span class="up">↑</span> visitors rate higher than editors</span>
  <span class="dot">·</span>
  <span><span class="down">↓</span> editors rate higher than visitors</span>
  <span class="dot">·</span>
  <span><b class="sleeper-tag-inline">EDITOR'S SLEEPER</b> high editorial rank, low traffic</span>
</div>
```

```css
.legend{
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--ink-line);
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center;
  font: 400 11px "Inter", system-ui, sans-serif;
  color: var(--text-5);
}
.legend .star{ color: var(--ochre); font-weight: 700; margin-right: 2px; }
.legend .up{ color: var(--delta-up); }
.legend .down{ color: var(--delta-down); }
.legend .dot{ color: var(--ink-line-2); }
.legend .sleeper-tag-inline{
  color: var(--ink-bg); background: var(--ochre);
  padding: 1px 5px;
  font-size: 9px;
  letter-spacing: .1em;
  font-weight: 600;
}
```

The legend is mandatory, not optional. The dual-rank concept is unfamiliar to most users on first arrival; the legend is what makes the table self-explanatory without needing a separate help page.

---

## 9. Data shape (per country row)

```ts
interface CountryRow {
  code:        string;   // ISO-3166 alpha-2, e.g. "FR"
  name:        string;
  ed:          number;   // editorial rank (1-based, integer)
  vis:         number;   // visitor rank (1-based, integer)
  entries:     number;   // catalogued entries in country
  mean:        number;   // mean editorial score, /5, two decimals
  top:         string;   // canonical top entry (display name)
  topSlug:     string;   // URL slug for the top entry
  era:         string;   // defining tradition, ≤ 4 words preferred
  note:        string;   // editor's note, 1 sentence, ≤ ~140 chars
  flag?:       'editorial-sleeper' | 'editorial-aligned' | null;
  href:        string;   // /countries/{slug}
}
```

If `topSlug` and `href` aren't yet wired, render the cells as plain spans (not links) until they are. Do not render `<a>` tags pointing to placeholder URLs.

---

## 10. Accessibility

- The table needs a `<caption>` (visually hidden is fine): "Catalogue countries ranked by editorial and visitor measures, sortable."
- Each rank column header gets a tooltip via `<th title="…">`: "Editorial rank — by the editorial board" and "Visitor rank — by aggregate ratings".
- The micro-arrow (`↑`/`↓`) gets `aria-hidden="true"`; the cell gets `aria-label="Visitor rank 31, lower than editorial"` (etc.). Without this, screen readers read meaningless arrow glyphs.
- The `EDITOR'S SLEEPER` tag is a `<span role="img" aria-label="Editor's sleeper">EDITOR'S SLEEPER</span>` so it doesn't read as random caps.
- Sort buttons need `aria-pressed="true"` on the active one.
- Color is supplementary, not the only signal — the arrow glyph carries the same information for color-blind users.
- Ensure WCAG AA contrast for `--delta-down` on the dark background; if it fails, darken to `#9A6655`.

---

## 11. Responsive

- **≥ 1180 px:** the layout above; editor's note column at `width: 360px`.
- **940 – 1179 px:** drop the **Mean** column and the **Top entry** column. Editor's note column shrinks to `min-content`.
- **720 – 939 px:** also drop **Defining tradition**. Note column gets `max-width: 280px`.
- **< 720 px:** transform each row into a stacked card — flag + name + dual rank on one line, entries/mean on a second line, tradition + editor's note as italic prose. Sort strip wraps under the section sub. The legend strip wraps to two lines.

Never horizontal-scroll the table. The fallback is always card-stacking.

---

## 12. Light mode

Mirror with the cream tokens. Specific overrides:

```css
@media (prefers-color-scheme: light) {
  :root{
    --delta-up: #4f7a55;
    --delta-down: #8a4a3a;
  }
  table.gazetteer tbody tr.flagged{
    background: linear-gradient(90deg, rgba(168,51,30,.04), transparent 70%);
  }
}
```

The light sleeper row uses the **heraldic red wash**, not ochre — the cream paper would lose an ochre tint to noise. This matches the editor's-note treatment in the Featured Hero spec.

---

## 13. Definition of done

- [ ] Two rank columns rendered with a consistent visual hierarchy: editorial = star + ochre serif; visitor = sans, with arrow and delta color when ≠ editorial.
- [ ] Three sort modes wired (Editorial / Visitor / By disagreement) with `aria-pressed` on the active button.
- [ ] "Last revised" stamp pulled from the data layer, not hardcoded.
- [ ] At least 5 % of visible rows carry an `editorial-sleeper` flag with a working diffuse-ochre row highlight + inline `EDITOR'S SLEEPER` tag in the editor's-note cell.
- [ ] Legend strip present, in the order specified.
- [ ] Country names link to `/countries/{slug}`; top entries link to `/entries/{slug}`; no placeholder hrefs.
- [ ] All currency-of-rank values (`★ Ed.`, `Vis.`) use **Arabic** numerals — Roman is reserved for individual entry rank.
- [ ] Light mode mirrored; sleeper highlight uses heraldic red wash, not ochre.
- [ ] Responsive collapses cleanly at 1179 / 939 / 719 px.
- [ ] Lighthouse a11y ≥ 95 on the Top countries page.

---

## 14. Out of scope

Do **not** in this round:
- Add country sparklines, mini-maps, or thumbnail images.
- Add tag chips for "Defining tradition" — keep it as italic prose.
- Wire client-side filters (search, region facet). Sort only.
- Touch the regions list (separate ticket — Option B in the same canvas).
- Restyle other tables on the site (Top 1000 table, period table) — this spec is local.

If anything is ambiguous, default to the visual reference at `Topcastles Top Countries.html` artboard A.
