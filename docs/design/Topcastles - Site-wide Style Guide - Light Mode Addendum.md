# Topcastles — Site-wide Style Guide · Light Mode Addendum
## Light-mode corrections for Claude Code

This addendum supplements `Topcastles Site-Wide Style Guide.md`. The dark mode is broadly correct; the light mode has drifted and needs a targeted sweep. Issues observed in the live light-mode screenshots:

- The masthead band reads as **warm cream**, but the nav band is the **dark-mode olive green** — they belong to two different palettes. The page now has two competing surfaces.
- A **lavender / periwinkle** is being used for section banners and quote backgrounds across `/background`. This color is not in the system. It collides with the ochre + heraldic-red wash and reads as "draft Bootstrap".
- The Featured Hero light fact-card has lost the cream-on-darker contrast — the cells dissolve into the surrounding paper.
- The shield bullet glyph (🛡️ / shield SVG) on the Background page is decorative and breaks the "no emoji / no decorative iconography" rule.
- The "About this list" sidebar uses the heraldic red for its border, but the per-section rule is mis-applied to other surfaces too — there is no longer one section-rule color.
- The collapsing nav drawer uses pure white panels with a left ochre accent stripe; should use cream paper + 1 px hairline.

The fixes below are atomic. Apply across every page; the dark mode is unaffected unless explicitly noted.

---

## 1. Light-mode tokens (replaces §1 light block)

```css
@media (prefers-color-scheme: light), (data-theme="light"){
  :root{
    /* — Surfaces — */
    --ink-bg:        #F5EFE0;   /* warm cream paper, page surface */
    --ink-bg-2:      #ECE3CD;   /* nav band, footer, deeper inset */
    --ink-card:      #FBF6E8;   /* card, table-row hover, fact-card cells */
    --ink-line:      #D9CFB5;   /* hairline rule (1 px) */
    --ink-line-2:    #BEB191;   /* card / table border */

    /* — Text — */
    --text-1:        #1B1610;   /* headings, primary */
    --text-2:        #2A2317;   /* emphasised body */
    --text-3:        #3D3522;   /* body */
    --text-4:        #6E6443;   /* italic captions, metadata */
    --text-5:        #847A56;   /* TH labels, footnotes */
    --text-6:        #9E946F;   /* dates, muted timestamps */

    /* — Brand & accent (slightly darker than dark-mode for AA on cream) — */
    --ochre:         #A8651E;
    --ochre-soft:    #8E6A2D;
    --heraldic-red:  #8C2A18;   /* used in editorial washes, sleeper rows */

    /* — Semantic deltas — */
    --delta-up:      #4F7A55;
    --delta-down:    #8A4A3A;

    /* — Light-mode-only nav band token — */
    --nav-bg:        #1F2A1A;   /* dark olive band, kept dark */
    --nav-fg:        #ECE3CD;   /* cream text on nav */
    --nav-fg-muted:  #B7AC85;
  }
}
```

**Rationale.** The masthead is paper, the nav is olive. The olive band stays dark in light mode — it's the brand horizon line, not a surface. Use `--nav-bg` / `--nav-fg` only there.

**Anti-token.** **Do not use lavender, periwinkle, or any blue/purple tint anywhere in light mode.** If the current build has `#D8D6F2`, `#E0DEF5`, `#C9C8E8` or similar, search-and-replace with `--ink-bg-2` for backgrounds and `--ochre-soft` for left-rule accents. There is no purple in the system.

---

## 2. The masthead / nav contract (corrects observed drift)

The masthead has two registers stacked vertically:

| Band | Surface | Text | Border |
|---|---|---|---|
| **Masthead** (wordmark, tagline, search) | `--ink-bg` (cream) | `--text-1` (near-black) | none |
| **Nav band** (Home / Top 1000 / Top Countries / …) | `--nav-bg` (olive) | `--nav-fg` (cream) | `border-bottom: 2px solid var(--ochre)` only when active tab present |

```css
.masthead{
  background: var(--ink-bg);
  color: var(--text-1);
  border-bottom: 1px solid var(--ink-line);
}
.nav-band{
  background: var(--nav-bg);
  color: var(--nav-fg);
}
.nav-band a{
  color: var(--nav-fg-muted);
  text-decoration: none;
}
.nav-band a:hover{ color: var(--nav-fg); }
.nav-band a[aria-current="page"]{
  color: var(--nav-fg);
  border-bottom: 2px solid var(--ochre);
  padding-bottom: 8px;
}
```

The active-tab indicator (`Top Countries` underlined ochre in the screenshots) is correct — keep it. The hover state should also be the ochre underline, not a lighter background fill.

---

## 3. Section banners — no purple block heads

The Background page currently uses **lavender block headers** (e.g. "Background", "What is a castle?", "Which castles do not qualify?") with dark text inside a periwinkle bar. This is a holdover from a previous theme.

**Replace** with the standard section head from §3 of the parent guide:

```html
<h1 class="page-head">Background</h1>

<h2 class="sec-head">What is a castle?</h2>
```

```css
.page-head{
  font: 600 32px/1.15 "Source Serif 4", serif;
  letter-spacing: -.012em;
  color: var(--text-1);
  margin: 0 0 6px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--ochre);
}
/* sec-head reuses §3 of parent guide — 22px Source Serif, 2 px ochre rule */
```

**Tab strip** under the page head (Definition / Scores / Resources / …) keeps the same hairline grammar:

```css
.page-tabs{
  display: flex; gap: 28px;
  border-bottom: 1px solid var(--ink-line);
  margin-bottom: 24px;
}
.page-tabs a{
  padding: 10px 0;
  color: var(--text-4);
  font: 500 13px/1 "Inter", system-ui, sans-serif;
  text-decoration: none;
}
.page-tabs a[aria-current="page"]{
  color: var(--text-1);
  border-bottom: 2px solid var(--ochre);
  margin-bottom: -1px;
}
```

No background fills on tabs. No purple anywhere.

---

## 4. Pull quotes / blockquotes (corrects lavender backgrounds)

Block quotes on `/background` currently use a lavender wash. Replace with the same **editor-note treatment** used in the Featured Hero — heraldic red wash, ochre left rule:

```css
blockquote, .pull-quote{
  margin: 14px 0;
  padding: 14px 20px;
  border-left: 2px solid var(--ochre);
  background: linear-gradient(90deg, rgba(140,42,24,.06), transparent 75%);
  font: italic 400 14.5px/1.6 "Source Serif 4", serif;
  color: var(--text-2);
  text-wrap: pretty;
}
blockquote::before{
  content: "\201C";
  font-style: normal;
  color: var(--ochre);
  font-size: 28px;
  line-height: 0;
  padding-right: 4px;
  position: relative; top: 6px;
}
```

The dark-mode equivalent uses the ochre wash (`rgba(201,134,63,.08)`); the light mode uses heraldic red (`rgba(140,42,24,.06)`) because ochre on cream is too low-contrast to register as a wash.

---

## 5. Lists — no decorative shield glyph

The Background page's bullet list currently uses a small shield SVG/emoji. Remove. Use a flat ochre dot, or — preferred for the reference register — a serif decorator hidden by default:

```css
.prose ul{
  list-style: none;
  padding-left: 0;
  margin: 8px 0 14px;
}
.prose ul li{
  position: relative;
  padding-left: 18px;
  margin-bottom: 4px;
  font: 400 14.5px/1.6 "Source Serif 4", serif;
  color: var(--text-3);
}
.prose ul li::before{
  content: "·";
  position: absolute;
  left: 6px; top: 0;
  color: var(--ochre);
  font-weight: 700;
  font-size: 18px;
  line-height: 1.4;
}
```

Numbered lists use straight Arabic numerals followed by a period (`1.`, `2.`), in `--ochre`, `font-weight: 600`, no parentheses.

The parent guide §10 anti-pattern stands: **no decorative iconography in body content.** The shield made the page feel like a fantasy-RPG handbook.

---

## 6. Featured Hero — light-mode fact-card contrast

In the screenshot, the fact-card cells (`★ 77 /1000` · `7.00 /10`) sit on a surface that is the same cream as the page, with hairline borders disappearing into the paper.

**Fix.**

```css
@media (prefers-color-scheme: light){
  .fact-card{
    background: linear-gradient(180deg, var(--ink-card) 0%, var(--ink-bg) 100%);
    border: 1px solid var(--ink-line-2);
    /* note: --ink-line-2 in light is #BEB191 — strong enough to read on cream */
  }
  .fact-card .cell{ border-right: 1px solid var(--ink-line-2); }
  .fact-card .lbl{ color: var(--text-5); }
  .fact-card .val{ color: var(--text-1); }
  .fact-card .val .unit{ color: var(--text-5); }
  .fact-card .sub{ color: var(--text-4); }
}
```

The cell-divider rule (`border-right`) must use `--ink-line-2`, not `--ink-line` — at 1 px on cream the lighter rule disappears. If the dividers still don't read at zoom, bump to 1.5 px in light mode only.

---

## 7. "About this list" sidebar — border treatment

Currently uses a heraldic-red border on the cream sidebar card. Keep it — but make it **consistent**: the same 1 px `--ink-line-2` border + a 3 px **left** rule in `--ochre`. Heraldic red is reserved for *editorial wash backgrounds* (block quotes, sleeper rows), not for borders.

```css
.sidebar-card{
  background: var(--ink-card);
  border: 1px solid var(--ink-line-2);
  border-left: 3px solid var(--ochre);
  padding: 16px 18px;
}
.sidebar-card .h{
  font: 600 10.5px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase; letter-spacing: .12em;
  color: var(--text-5);
  margin: 0 0 10px;
}
```

The "Castle of the Week" card uses the same treatment, no exceptions. **Do not** give different sidebar cards different border colors.

---

## 8. Mobile / drawer nav — paper, not white

The drawer in the mobile screenshot uses pure `#FFFFFF` panels with a thick `--ochre` left accent stripe on the active row. Replace with cream paper + 1 px hairlines, matching the rest of the system:

```css
.drawer{
  background: var(--ink-bg);
  border-right: 1px solid var(--ink-line);
}
.drawer a{
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--ink-line);
  color: var(--text-3);
  font: 500 14px/1 "Inter", system-ui, sans-serif;
  text-decoration: none;
}
.drawer a[aria-current="page"]{
  color: var(--text-1);
  background: var(--ink-card);
  box-shadow: inset 3px 0 0 var(--ochre);   /* the ochre stripe stays — but as inset shadow, not a separate element */
}
.drawer .drawer-action{
  /* "Nearest Top Castle", "Install app", "Dark mode" — secondary actions */
  background: var(--ink-card);
  border: 1px solid var(--ink-line-2);
  margin: 6px 12px;
  justify-content: center;
}
```

The drawer-action buttons (Nearest Top Castle / Install app / Dark mode) currently have rounded corners — make them **square** to match §6 of the parent guide. No `border-radius`.

The "Dark mode" button takes the same shape as the other two; it is not a special pill.

---

## 9. The "TRADITION" / "EDITOR'S NOTE" header conflict

In the live Top Countries page, the column headers `TRADITION` and `EDITOR'S NOTE` are clearly visible — but several rows have **empty** cells under them. Either:

1. **Populate every row** with a tradition + editor's note (preferred — the spec calls for this), or
2. **Don't render the column heads** when the data is missing, and render the column as *italic continuation* below the country name (one cell, two lines).

Shipping headers above empty cells communicates "we forgot to fill this in." Pick one and apply consistently.

A row without an editor's note must still get its `tradition` cell populated, otherwise the editorial layer is failing on most rows. If editorial bandwidth is the bottleneck, hand-write notes for the **top 12** countries first; rows 13+ may collapse the two columns into a single italic `tradition` cell until copy lands.

---

## 10. Sweep checklist — light-mode pass

Run after the dark-mode sweep is complete.

1. Search the codebase for **lavender / periwinkle** hex codes (`#D8D6F2`, `#E0DEF5`, `#C9C8E8`, `#EAEAFF`, `#F0EFFB`, anything in the 230-260° hue range) and replace per §3 / §4.
2. Verify the masthead is cream and the nav band is olive — both in light mode (§2).
3. Replace every `<blockquote>` background with the heraldic-red wash + ochre left rule (§4).
4. Remove all decorative shield / castle / sword glyphs from body content (§5).
5. Replace page-head block banners with serif page heads + 2 px ochre underline (§3).
6. Verify the Featured Hero fact-card dividers are visible on cream (§6).
7. Standardise sidebar card borders to 1 px `--ink-line-2` + 3 px ochre left rule (§7).
8. De-round drawer / nav buttons; switch drawer panel from white to cream (§8).
9. Audit every table for empty `Editor's note` cells; populate or collapse (§9).
10. Confirm `--ochre` and `--delta-down` pass WCAG AA on `--ink-bg` at body sizes; if `--delta-down` fails, darken to `#7A3F30`.
11. Re-confirm dark mode is unaffected — no token outside the `@media (prefers-color-scheme: light)` block has changed.

---

## 11. Anti-patterns to add to §13 of the parent guide

- ❌ **Purple/lavender of any kind.** Not for headers, not for backgrounds, not for hover states.
- ❌ **Cream masthead with cream nav.** The nav band stays dark olive. Always.
- ❌ **White panels in light mode.** The page is cream paper. Pure `#FFF` reads as a different surface entirely.
- ❌ **Decorative bullet glyphs** (shield, castle, crown). Use the dot from §5.
- ❌ **Coloured banner heads** (bar of color behind a heading). Use the 2 px ochre underline from §3, every time.
- ❌ **Heraldic red as a border or stroke.** Reserve it for editorial wash backgrounds only.
- ❌ **Empty cells under populated column heads.** Either fill the data or collapse the column.

If anything is ambiguous, default to the dark-mode rendering — it's the canonical reference. The light mode is a paper-print of the same system, not a different one.

# Summary

1. **Light tokens** — full palette block, with explicit "no purple" anti-tokens and the dark olive --nav-bg carved out as a non-surface color.
2. **Masthead vs nav band contract** — fixes the two-palette drift; cream paper above, dark olive below, ochre underline for active tab.
3. **Section banners** — replaces the lavender block heads on /background with the standard serif page-head + 2 px ochre rule.
4. **Block quotes** — heraldic-red wash with ochre left rule (light-mode equivalent of the dark-mode ochre wash).
5. **Lists** — kills the shield bullet glyph; flat ochre dot, no decorative iconography.
6. **Featured Hero fact-card** — fixes invisible dividers on cream by switching to --ink-line-2.
7. **Sidebar cards** — single border treatment (hairline + 3 px ochre left rule); heraldic red is for washes only, never strokes.
8. **Mobile drawer** — switches white panels to cream paper, square corners, inset ochre stripe for active row.
9. **Editor's-note column policy** — either fill every row or collapse the column; no empty cells under populated headers.
10. **Sweep checklist** — 11-step pass to run after the dark-mode work lands.
11. **Anti-patterns** — to fold into §13 of the parent guide.