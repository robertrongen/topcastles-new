# Topcastles — Site-wide Style Guide
## Concise design-system reference for Claude Code

A short, opinionated style sheet that should be applied **consistently to every page** — homepage, /top-1000, /countries, /regions, /entries/*, /map, /background, /dataset, /favorites. If a page disagrees with this guide, this guide wins.

Pairs with the per-page specs (Masthead Option A, Featured Hero Option A, Top Countries Option A). Those define structure for their pages; this defines the *atoms* used by all of them.

---

## 1. Tokens (single source of truth)

Put these in a global stylesheet (`tokens.css` or top of the root `:root`). Every page must read from these — no hex codes inline, no per-page palette overrides except where this guide explicitly says so.

```css
:root{
  /* — Surfaces (dark mode default) — */
  --ink-bg:        #0E1320;   /* page surface */
  --ink-bg-2:      #0B101C;   /* deeper inset (sidebars, code, footer) */
  --ink-card:      #141B2C;   /* card / table-row hover fill */
  --ink-line:      #1d2434;   /* hairline rule */
  --ink-line-2:    #2a3550;   /* card / table top+bottom border */

  /* — Text — */
  --text-1:        #F2EAD3;   /* headings, primary */
  --text-2:        #E8E2D2;   /* emphasised body */
  --text-3:        #C5C0AF;   /* body */
  --text-4:        #9AA8BD;   /* italic captions, metadata */
  --text-5:        #7A8AA0;   /* TH labels, footnotes */
  --text-6:        #5e6a82;   /* dates, muted timestamps */

  /* — Brand & accent — */
  --ochre:         #C9863F;   /* the only accent */
  --ochre-soft:    #C9B98F;   /* warm muted gold (links in low-contrast roles) */
  --heraldic-red:  #A8331E;   /* used only in light mode editorial washes */

  /* — Semantic deltas (rank/score comparisons) — */
  --delta-up:      #7BA77A;   /* sage — visitors higher than editors */
  --delta-down:    #A87968;   /* terracotta — editors higher than visitors */
}

@media (prefers-color-scheme: light){
  :root{
    --ink-bg:        #F6F0E2;   /* warm cream paper */
    --ink-bg-2:      #EFE7D2;
    --ink-card:      #FAF4E5;
    --ink-line:      #D9CFB8;
    --ink-line-2:    #C7BA9E;
    --text-1:        #1F1A12;
    --text-2:        #2E2719;
    --text-3:        #3F3826;
    --text-4:        #6A5F45;
    --text-5:        #7E7558;
    --text-6:        #948A6E;
    --ochre:         #A8651E;   /* slightly darker for AA on cream */
    --ochre-soft:    #8E6A2D;
    --delta-up:      #4F7A55;
    --delta-down:    #8A4A3A;
  }
}
```

**Rule:** new colors require a token. If you find yourself reaching for a hex code, add it here first.

---

## 2. Typography

Two families only. Never substitute system fonts.

```css
/* in <head> */
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

| Role | Family | Notes |
|---|---|---|
| Headings, prose, italic editorial voice | **Source Serif 4** | The publication's voice. Italic = editorial. |
| UI chrome (nav, buttons, tags, labels, table TH, meta) | **Inter** | Always sans. Never used for body prose. |
| Code / dataset values | JetBrains Mono | Optional; only for the dataset/API page and flag tiles. |

### Site-wide type ramp

Apply these classes (or equivalents) on **every page**. Do not invent new heading sizes.

```css
.h1{ font: 600 32px/1.15 "Source Serif 4", serif; letter-spacing: -.012em; color: var(--text-1); }
.h2{ font: 600 22px/1.2  "Source Serif 4", serif; color: var(--text-1); }     /* section heads */
.h3{ font: 600 16px/1.3  "Source Serif 4", serif; color: var(--text-1); }
.h4{ font: 600 13px/1.3  "Source Serif 4", serif; color: var(--text-1); }     /* sidebar heads */

.body{      font: 400 15px/1.62 "Source Serif 4", serif; color: var(--text-3); }
.body-sm{   font: 400 13px/1.55 "Source Serif 4", serif; color: var(--text-3); }
.italic-cap{ font: italic 400 13.5px/1.5 "Source Serif 4", serif; color: var(--text-4); }

.eyebrow{                                              /* kickers, all caps */
  font: 600 11px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .12em;
  color: var(--ochre);
}
.label{                                                /* TH, sort-strip "Sort" */
  font: 600 10px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .09em;
  color: var(--text-5);
}
.meta{ font: 400 11px/1.5 "Inter", system-ui, sans-serif; color: var(--text-5); }
```

**Italics rule.** Italic Source Serif = editorial voice (notes, captions, defining-tradition, signatures). Never use italic for emphasis inside body prose — use weight 600 instead.

**Numerals rule.** All catalogue numbers, dates, entry counts, page numbers: **Arabic**. Roman numerals are reserved for *individual entry editorial rank* (`★ XXIX/1000`). Country/region rank columns use Arabic.

---

## 3. Section heads

The single most-repeated pattern on the site. Render identically on every page, every section.

```html
<h2 class="sec-head">
  Top countries
  <a class="more" href="/countries">All countries ▸</a>
</h2>
<p class="sec-sub">Italic, single sentence framing the section.</p>
```

```css
.sec-head{
  font: 600 22px/1.2 "Source Serif 4", serif;
  color: var(--text-1);
  margin: 0 0 4px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--ochre);
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
}
.sec-head .more{
  font: 500 11px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--ochre);
  text-decoration: none;
}
.sec-head .more:hover{ text-decoration: underline; text-underline-offset: 3px; }

.sec-sub{
  font: italic 400 13.5px/1.5 "Source Serif 4", serif;
  color: var(--text-4);
  margin: 6px 0 18px;
  text-wrap: pretty;
  max-width: 880px;
}
.sec-sub em{ color: var(--ochre-soft); font-style: italic; }
```

**Rules:**
- Always 2 px ochre underline. Never 1 px, never another color, never dotted.
- The right-side `.more` link must point to a **real destination**. If the destination doesn't exist yet, omit the link entirely. Never link to `/top-1000` from an "Archive" or "All" affordance — that creates the duplicate-nav problem.
- Section subs are always one sentence, italic. Never two paragraphs, never bullet lists.

---

## 4. Tables

The site is full of them. One stylesheet for all.

```html
<table class="tc-table">
  <caption class="sr-only">Caption describing the table.</caption>
  <thead>
    <tr>
      <th class="num"></th>
      <th>Column</th>
      <th class="rk">★ Ed.</th>
      <th class="rk">Vis.</th>
      <th class="num">Entries</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="num idx">1</td>
      <td><a>Row label</a></td>
      <td class="ed"><span class="star">★</span>1</td>
      <td class="vis higher">2<span class="micro-arrow">↑</span></td>
      <td class="num">1,802</td>
    </tr>
  </tbody>
</table>
```

```css
.tc-table{
  width: 100%;
  border-collapse: collapse;
  font-family: "Inter", system-ui, sans-serif;
  font-size: 13px;
}
.tc-table thead th{
  text-align: left;
  font: 600 10px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .09em;
  color: var(--text-5);
  padding: 8px 10px;
  border-bottom: 1px solid var(--ink-line-2);
  white-space: nowrap;
}
.tc-table thead th.num,
.tc-table tbody td.num{ text-align: right; font-variant-numeric: tabular-nums; }
.tc-table thead th.rk{ text-align: right; }

.tc-table tbody td{
  padding: 10px;
  border-bottom: 1px solid var(--ink-line);
  color: var(--text-3);
  vertical-align: top;
}
.tc-table tbody tr:hover td{ background: var(--ink-card); }

/* primary text cells (entry/country/region names) — always serif */
.tc-table tbody td a{
  font: 600 14.5px "Source Serif 4", serif;
  color: var(--text-1);
  text-decoration: none;
}
.tc-table tbody td a:hover{ color: var(--ochre); }

/* index cell, muted */
.tc-table td.idx{ color: var(--text-5); width: 26px; font-size: 12px; }

/* dual rank columns — use everywhere editorial vs visitor are compared */
.tc-table td.ed{
  text-align: right;
  font: 600 14px "Source Serif 4", serif;
  font-variant-numeric: tabular-nums;
  color: var(--ochre);
  width: 56px;
}
.tc-table td.ed .star{ margin-right: 4px; }
.tc-table td.vis{
  text-align: right;
  font: 400 13px "Inter", system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  color: var(--text-4);
  width: 56px;
}
.tc-table td.vis.higher{ color: var(--delta-up); font-weight: 500; }
.tc-table td.vis.lower{  color: var(--delta-down); font-weight: 500; }
.tc-table td.vis .micro-arrow{ font-size: 10px; margin-left: 2px; opacity: .85; }

/* italic prose cells (defining tradition, era, period) */
.tc-table td.era{ font: italic 400 13px "Source Serif 4", serif; color: var(--text-4); }

/* the editorial sleeper / featured row highlight — diffuse, not bright */
.tc-table tbody tr.flagged{
  background: linear-gradient(90deg, rgba(201,134,63,.05), transparent 70%);
}
.tc-table tbody tr.flagged:hover td{
  background: linear-gradient(90deg, rgba(201,134,63,.10), var(--ink-card) 70%);
}

/* light-mode flagged rows use heraldic red wash */
@media (prefers-color-scheme: light){
  .tc-table tbody tr.flagged{
    background: linear-gradient(90deg, rgba(168,51,30,.04), transparent 70%);
  }
}
```

**Rules:**
- Never apply zebra striping. The dotted bottom borders + sleeper gradients are the only horizontal articulation.
- Never horizontal-scroll. On narrow viewports, drop secondary columns or card-stack the rows.
- Numeric cells always tabular-nums + right-aligned. Never proportional figures in a table.
- Row hover is `--ink-card`, never bright. The table is for reading, not for clicking targets.

---

## 5. Tags / labels / pills

Strict inventory. **Three** tag styles for the whole site.

```css
/* (a) The accent tag — used sparingly. EDITOR'S SLEEPER, FEATURED, NEW. */
.tag-accent{
  display: inline-block;
  font: 600 9.5px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--ink-bg); background: var(--ochre);
  padding: 2px 6px;
}

/* (b) The neutral tag — for taxonomy (period, type, country chip). */
.tag-neutral{
  display: inline-block;
  font: 500 10.5px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--text-4); background: var(--ink-line);
  border: 1px solid var(--ink-line-2);
  padding: 3px 8px;
}

/* (c) The flag tile — used for country codes only (mono, fixed width). */
.flag-tile{
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 22px;
  background: var(--ink-line); border: 1px solid var(--ink-line-2);
  color: var(--ochre-soft);
  font: 600 10px "JetBrains Mono", ui-monospace, monospace;
  letter-spacing: .06em;
}
```

**Rules:**
- No new tag styles without a token review. Don't introduce coloured tag variants per-page.
- The accent tag uses `--ochre` solid. In light mode, swap to `--heraldic-red` background with `--ink-bg` (cream) text.
- Never combine tag styles in the same row.

---

## 6. Buttons & links

| Kind | Visual | Where |
|---|---|---|
| **Primary CTA** | `--ochre` solid, ink text, no rounding, 4 px vertical / 12 px horizontal padding | Sort-strip active, "Read full entry" |
| **Secondary** | Transparent, 1 px `--ink-line-2` border, `--text-4` text, hover → `--text-1` + `--ochre-soft` border | Sort-strip inactive, action links |
| **Inline link** (chrome) | `--ochre` text, no underline default, underline on hover (offset 3 px) | Section "more" links, kickers |
| **Inline link** (prose) | `--ochre-soft` italic, underline on hover | Top-entry cell, in-paragraph links |
| **Body link** (in serif prose) | `--text-1` 600 weight, hover → `--ochre` | Country / entry names in tables |

```css
.btn-primary{
  background: var(--ochre); border: 1px solid var(--ochre);
  color: var(--ink-bg); font: 600 11.5px/1 "Inter", sans-serif;
  padding: 4px 12px; cursor: pointer;
}
.btn-secondary{
  background: transparent; border: 1px solid var(--ink-line-2);
  color: var(--text-4); font: 400 11.5px/1 "Inter", sans-serif;
  padding: 4px 12px; cursor: pointer;
  transition: color .12s, border-color .12s;
}
.btn-secondary:hover{ color: var(--text-1); border-color: var(--ochre-soft); }
```

**Rule:** never add `border-radius` to buttons or tags. The site is square-edged everywhere; rounded corners read as web-app, not reference work.

---

## 7. Cards

Used for region cards, sidebar boxes, fact cards.

```css
.tc-card{
  background: linear-gradient(180deg, var(--ink-card) 0%, var(--ink-bg) 100%);
  border: 1px solid var(--ink-line-2);
  padding: 16px;
}
.tc-card.flagged{
  border-color: var(--ochre);
  box-shadow: inset 0 0 0 1px rgba(201,134,63,.15);
}
.tc-card-head{
  font: 600 13px "Source Serif 4", serif;
  color: var(--text-1);
  border-bottom: 1px solid var(--ink-line-2);
  padding-bottom: 6px;
  margin-bottom: 10px;
  text-transform: none;
}
```

No `border-radius`. No drop shadows beyond the inset highlight on flagged cards. The page is flat.

---

## 8. Hairline rules — the layout grammar

The site is articulated by **hairlines, not whitespace alone**.

| Use | Color | Width |
|---|---|---|
| Section underline | `--ochre` | **2 px solid** |
| Card / fact-card border | `--ink-line-2` | 1 px solid |
| Table TH bottom | `--ink-line-2` | 1 px solid |
| Table TR bottom | `--ink-line` | 1 px solid |
| Footer / sidebar separator | `--ink-line` | 1 px solid |
| Inline meta separator | `--ink-line-2` | 1 px dotted (only on metadata strips) |

**Rule:** never use heavy rules (3 px+) except the section underline. Never stack two rules within 8 px of each other.

---

## 9. Spacing rhythm

Keep to multiples of 4. Specifically:

```
inside-card padding:   14–18 px
between-card gap:      14 px (grid)
between-section gap:   28–36 px
section-sub → content: 18 px
heading → first item:  4–8 px
table row padding:     10 px vertical
```

No 11 px, 13 px, 17 px gaps. Snap.

---

## 10. Iconography

- **Star (★)** — editorial rank only. Reserve.
- **Arrows (↑ ↓)** — rank deltas. Never used as nav chevrons (use `▸` for those).
- **Triangle (▸)** — "more" affordance in section heads, breadcrumbs.
- **Section sign (§)** — entry / region anchors only.
- **Numero (№)** — catalogue numbers.
- **Save / favorite** — single canonical SVG. Outline star unsaved, filled `--ochre` saved. Used identically in masthead nav, per-entry save affordance, and Favorites page header. Never mix unicode glyphs with SVG.

**Rule:** no decorative emoji anywhere. The reference-work feel collapses the moment a 🏰 appears.

---

## 11. Photos / images

```css
.tc-photo{
  background: var(--ink-card);
  border: 1px solid var(--ink-line-2);
  position: relative; overflow: hidden;
}
.tc-photo::after{          /* subtle bottom darkening so plate stamps stay legible */
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,.45) 100%);
  pointer-events: none;
}
.frame-stamp{
  position: absolute; left: 14px; bottom: 12px;
  font: 600 10.5px "Inter", sans-serif;
  text-transform: uppercase; letter-spacing: .12em;
  color: rgba(242,234,211,.78);
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.12);
  padding: 5px 9px;
}
```

Captions always **outside** the image, in a separate flex row beneath. Never overlay the caption on the photograph (only the plate stamp is allowed inside the frame).

---

## 12. Accessibility floor

- Every section head pairs with `aria-labelledby`.
- All `↑/↓` glyphs `aria-hidden="true"`; the cell carries `aria-label="Visitor rank 31, lower than editorial"`.
- Roman numerals must carry an Arabic-numeral `aria-label` (`★ XXIX/1000` → `aria-label="Editorial rank 29 of 1000"`).
- Sort buttons: `aria-pressed="true"` on the active one.
- Color is never the sole signal — pair with a glyph or text.
- Contrast: `--delta-down` on `--ink-bg` must pass AA at 13 px / 500 weight. If it doesn't, darken to `#9A6655`.
- Focus ring: 2 px `--ochre` outline, 2 px offset, on every focusable element. Never `outline: none` without a replacement.

---

## 13. Anti-patterns (do not ship)

- ❌ `border-radius` on buttons, tags, cards, inputs.
- ❌ Drop shadows (except inset card highlight on flagged).
- ❌ Gradient backgrounds at scale (only the editor's-note 8 % wash and card 0 → bg gradients are allowed).
- ❌ Emoji in UI or content.
- ❌ Centred body prose.
- ❌ Section sub spanning > 2 lines.
- ❌ Roman numerals on dates, page numbers, list indices.
- ❌ Two CTAs that do the same thing on the same page (e.g. "Surprise me" + "Discover the list").
- ❌ Header links pointing to duplicate pages (Archive ▸ → /top-1000).
- ❌ Single-rank tables when both editorial and visitor ranks exist for the data.
- ❌ Zebra striping on tables.
- ❌ System UI font fallback rendering. Confirm Source Serif 4 + Inter loaded.

---

## 14. Sweep checklist for Claude Code

For each page, in order:

1. Replace any inline hex codes with tokens from §1.
2. Confirm Source Serif 4 + Inter are the only families used. Remove any other Google Fonts imports.
3. Re-style every section head to §3.
4. Re-style every table to §4 — including dropping zebra striping and converting any rounded cells to square.
5. Audit all "more / archive / all" links. Either point them at a real page or remove them.
6. Replace ad-hoc tag/badge styles with §5's three tags.
7. Replace any rounded buttons with §6's square buttons.
8. Replace any hex-coded delta/highlight colors with `--delta-up` / `--delta-down` / the flagged-row gradient.
9. Strip emoji from content.
10. Verify the favorites/save icon is the same SVG in masthead, per-row save, and Favorites page.
11. Verify Roman numerals appear only on individual entry editorial ranks. All other numerals → Arabic.
12. Run Lighthouse a11y; fix anything < 95.

If a page has its own structural spec (Masthead, Featured Hero, Top Countries), apply this guide *under* it: the per-page spec wins on layout, this guide wins on atoms.
