# Topcastles — Site-wide Style Guide · Type-scale Addendum

This addendum supplements the parent guide and the previous two addenda. The system is reading — the issue now is **type rhythm**: relative sizes between heading levels, between heading and body, and the masthead's two registers. Notes are grouped by surface and ordered by impact.

The intent is **minor tuning, not a redesign.** Keep the typefaces, weights, and palette. Adjust sizes, tracking, and a couple of vertical rhythms so the hierarchy reads at a glance.

---

## 1. The Topcastles wordmark is too big

Across every screenshot, the wordmark `Topcastles.` consumes roughly 40 % of the masthead height and visually outweighs the tagline 6:1. A reference site's wordmark should be quietly authoritative — present, but not the loudest thing on screen.

| Surface | Now | Recommend |
|---|---|---|
| `.wordmark` | ~40 px / 600 / `-.02em` | **30 px / 600 / `-.018em`** |
| `.tagline` | ~13 px italic | **13.5 px italic, `--text-3`** (slightly darker so it doesn't disappear) |
| Masthead vertical padding | ~22 px | **18 px** |

The tagline is currently `--text-4` (caption grey). Bump to `--text-3` so it carries weight as a subtitle, not a footnote. The relative shift — wordmark down, tagline up — closes the gap and makes the masthead read as one editorial unit instead of "logo + small legalese."

The trailing period (`Topcastles.`) is a nice touch — keep it, but make sure it inherits the wordmark's color, not the accent.

---

## 2. Page heads are correct; section heads are too small

Page heads (`Top countries`, `Background`, `Data Access & Developer Guide`) at ~32 px serif with the 2 px ochre rule are the right size. Don't change them.

The problem is **inside** a page: section heads (`What is a castle?`, `Which castles do not qualify?`) are rendering at ~18–19 px — too close to body type. The reader can't tell at a glance which heading owns which paragraph.

Recommend tightening the scale:

```
Page head     32 / 1.15 / 600          ← unchanged
Section head  22 / 1.2 / 600           ← was ~18; bump
Subsection    14 / 1.3 / 700 caps .08em ← "Definition", "City castles" — already correct
Body          15 / 1.55 / 400          ← was ~14; see §4
Caption       12.5 / 1.4 / 400 italic  ← unchanged
```

The 22 px section head is still quiet — it's not a magazine head — but at +7 px over body it earns its hierarchy without a coloured banner. Pair with the existing 1 px ochre rule below.

The ochre rule below section heads is **too long** in the current build (full content width). Cap it at the longer of the heading text or 320 px:

```css
.sec-head{
  font: 600 22px/1.2 "Source Serif 4", serif;
  letter-spacing: -.008em;
  color: var(--text-1);
  margin: 28px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--ochre);
  /* Constrain the rule to roughly the head's measure */
  max-width: max(320px, min-content);
  width: max-content;
}
```

A short ochre rule reads as a hairline accent. A full-width ochre rule reads as a section divider — which is what `<hr>` is for.

---

## 3. The featured-entry title is set too large

On the homepage, **`Castel Roncolo (Schloss Runkelstein)`** is breaking onto three lines and visually competing with the painting next to it. The title is the *caption to the image*, not the page head.

Recommend:

```
.feature-title   28 / 1.1 / 600        ← was ~34
.feature-meta    13.5 italic            ← unchanged
.feature-period  10.5 caps .12em + value at 13/400 italic   ← unchanged
.feature-body    15 / 1.55 / 400 serif  ← was ~14
```

At 28 px, two-word titles fit on one line and three-word titles wrap once. The current 34 px forces a hard wrap on most entries, which is why the layout feels lopsided.

If the title is genuinely long (`Castel Roncolo (Schloss Runkelstein)`), let it wrap but soften the wrap with `text-wrap: balance` — never `pretty` for a title. Balance keeps the lines visually similar; pretty only fixes orphans on the last line, which isn't what a multi-line title needs.

---

## 4. Body type is one click too small everywhere

Body copy across Background, Top Countries notes, About-this-list, and the featured entry is rendering around 13.5–14 px. That's fine for tabular data and chrome, but **prose** wants 15 px. The Background page especially — long-form definitions and block quotes — would breathe noticeably with a single-pixel bump.

| Surface | Now | Recommend |
|---|---|---|
| Long-form prose (Background, methodology) | ~14 | **15 / 1.6** |
| Featured-entry summary | ~14 | **15 / 1.55** |
| Sidebar prose ("About this list") | ~13.5 | **14 / 1.55** |
| Table cells (Top Countries) | ~13 | **13 / 1.4** — keep |
| `EDITOR'S NOTE` italic in tables | ~12 | **12.5 / 1.4** |
| Captions / metadata | ~12 | **12 / 1.4** — keep |

Don't touch tabular type — it's correctly compact. The change is only for **prose surfaces**, where line length and rhythm matter.

Pair the 15 px body with `max-width: 64ch` on prose containers. The Background page currently runs the body to ~95 ch on a wide viewport, which is past the comfortable-reading ceiling.

---

## 5. The Top Countries table — column-head tracking

`COUNTRY · ★ ED. · VIS. · ENTRIES · MEAN · TRADITION · EDITOR'S NOTE · TOP ENTRY` reads slightly cramped because the caps tracking is too tight (~`.04em`). The standard for caps labels in this system is `.12em` (parent guide §3).

Recommend:

```css
.tc-table thead th{
  font: 600 10.5px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--text-5);
  padding: 14px 12px;
  border-bottom: 1px solid var(--ink-line);
  text-align: left;
}
```

Bumping `letter-spacing` is more important than changing the size; at `.12em` the column heads breathe and the table reads as a reference table, not a data dump.

While we're in the Top Countries table:
- The **delta arrows** (`↑ 3`, `↓ 9`) are doing their job. Keep red/green muted as they are.
- The **rank `★ N`** column should use the same star glyph (`★`) at the same size as the rest of the site — it's currently a hair smaller than the visitor-rank column.
- The **`EDITOR'S SLEEPER`** badge on row 19 (Syria) is the right intensity. Don't add more badge variants — one editorial flag is enough.

---

## 6. Background page tab strip — alignment

The tab strip below the `Background` page head (`Definition / Scores / Resources / Castle types / Websites / Books / Photographers`) has uneven vertical rhythm: the active-tab underline (`Definition`) sits 2 px below the others, and the gap between `Definition` and `Scores` is wider than between the others.

Fix is purely structural:

```css
.page-tabs{
  display: flex;
  gap: 28px;                /* even gap, all tabs */
  margin: -8px 0 24px;       /* tighter to the page head */
  border-bottom: 1px solid var(--ink-line);
}
.page-tabs a{
  padding: 10px 0;
  margin-bottom: -1px;       /* every tab, not just active */
  border-bottom: 2px solid transparent;
  color: var(--text-4);
  font: 500 13px/1 "Inter", system-ui, sans-serif;
  letter-spacing: .02em;
  text-decoration: none;
}
.page-tabs a[aria-current="page"]{
  color: var(--text-1);
  border-bottom-color: var(--ochre);
}
```

The `margin-bottom: -1px` on every tab (not only the active one) is the trick — it keeps the underline at a consistent baseline regardless of state.

---

## 7. Block-quote sizing on Background

The italic block quotes on Background are rendering at the same size as body and reading as "more body, but italic." A pull-quote should be **slightly larger** than its host text — that's how the eye registers it as a quote instead of an aside.

```css
blockquote{
  font: italic 400 16px/1.65 "Source Serif 4", serif;   /* +1 over body */
  color: var(--text-2);
  margin: 18px 0;
  padding: 4px 22px;
  border-left: 2px solid var(--ochre);
  text-wrap: pretty;
  max-width: 60ch;
}
```

The opening curly quote (`"`) is currently rendered as part of the source text. Render it via `::before` at +6 px in `--ochre`, lifted slightly above the baseline (parent guide light-mode addendum §4). It pulls the eye into the quote and reinforces the editorial register.

---

## 8. Developer / API page — card titles

The four "What's available" cards (`REST / JSON API`, `MCP Server`, `Data Schema`, `For AI Agents`) have titles wrapping awkwardly because the title size is roughly the card width allowance. Either:

- Bump card minimum width to fit `REST / JSON API` on one line at the current size, **or**
- Drop title size by 1 px (16 → 15) and let the slash break naturally.

I'd take the second option — at 15 px serif 600, the title still reads as a heading, and the four cards keep equal heights. The hand-holding "REST / JSON API" wrap is fine; it's actually informative (tells the reader the same thing is two formats).

The icons in each card's top-left circle are *fine* but they break the parent guide's "no decorative iconography" rule. Either:
- Replace with the section-numbered glyph used elsewhere (`§01`, `§02`, …) at the same circle size, **or**
- Drop the circle entirely — title alone, no glyph.

The latter is more in keeping with the rest of the site. The icons are vestigial Material-ism and don't add information.

---

## 9. Drawer (mobile / collapsed nav) — type and rhythm

In the open-drawer screenshot:

- **Item label** (`Home`, `Top 1000`, …) is rendering at ~16 px medium. Drop to **14 px / 500** to match the desktop nav. The drawer items shouldn't be louder than the desktop tabs.
- **Item icon** is rendering at ~22 px outline. Keep, but switch to the same hairline glyph weight used in the masthead utility cluster (paper-plane, bookmark, sun). Currently the drawer glyphs are slightly chunkier — tighten the strokes by ~0.5 px.
- **Drawer-action buttons** (`Nearest Top Castle`, `Install app`, `Dark mode`) — already addressed in the light-mode addendum (§8: square corners, cream surface). Add: the label inside should be **12.5 px medium uppercase `.08em`**, not the same 16 px as the menu items. Buttons aren't menu items; the type should signal that.

---

## 10. Vertical rhythm across the homepage

A small thing the eye registers without naming: **the gap between `FROM TODAY'S INDEX` and the painting is too tight, and the gap between the painting and `DISTRIBUTION` is too generous.** The page reads slightly top-heavy.

| Region | Recommend |
|---|---|
| Section eyebrow (`FROM TODAY'S INDEX`) → content | 24 px (was ~12) |
| Content → next eyebrow (`DISTRIBUTION`) | 56 px (was ~80) |
| Eyebrow itself: caps 10.5 / `.12em` | unchanged |

Same vertical rhythm should govern every section: 24 px below an eyebrow, 56 px above the next one. If rhythm is consistent, the reader's eye learns to scan.

---

## 11. Sweep checklist — tuning pass

1. Wordmark 40 → 30; tagline `--text-4` → `--text-3`.
2. Section heads 18 → 22 with constrained ochre rule.
3. Featured-entry title 34 → 28; `text-wrap: balance`.
4. Prose body 14 → 15 / 1.55–1.6; cap prose at 64 ch.
5. Top Countries column-head tracking → `.12em`.
6. Background page tabs: even `gap`, `margin-bottom: -1px` on every tab.
7. Block quotes: 16 / 1.65; ::before quote glyph in ochre.
8. Developer card titles 16 → 15; remove card icons or replace with `§NN`.
9. Drawer items 16 → 14 / 500; drawer-action buttons 12.5 caps.
10. Homepage rhythm: 24 below eyebrow, 56 above next.

None of these are restructuring — every fix is a token bump or a one-line CSS change. The system you have is right; it just needs the type tuned.

If something here conflicts with an earlier addendum, the **earlier addendum wins** — these are minor adjustments on top of structural decisions already made.

# Summary

## Main points
- Wordmark too big (40 → 30 px), tagline darkened (--text-4 → --text-3). Closes the gap so the masthead reads as one editorial unit.
- Section heads too small (18 → 22 px) with the ochre rule constrained to the heading width — a full-width ochre rule reads as a divider, not an accent.
- Featured-entry title too big (34 → 28 px) with text-wrap: balance. Currently breaks awkwardly across three lines and out-shouts the painting.

## Body rhythm:
- Prose body 14 → 15 / 1.55–1.6 on Background, About-this-list, featured summary. Cap prose at 64 ch — Background currently runs to ~95 ch.
- Don't change tabular type. The Top Countries table is correctly compact; only the column-head tracking needs .12em.

## Other
- Vertical rhythm rule for the homepage: 24 px below an eyebrow, 56 px above the next one. If consistent across every section, the reader's eye learns to scan.
- Smaller fixes: Background tabs alignment trick (margin-bottom: -1px on every tab), block-quote +1 px over body, Developer-card icons drop or convert to §NN, drawer items 16 → 14.
- §11 has a numbered sweep checklist for whoever's implementing.