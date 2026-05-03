# Topcastles — "From today's index" Hero (Option A: Editorial Dossier)
## Implementation style guide for Claude Code

**Scope.** Replace the existing "From today's index" / featured-entry hero block on the homepage with the *Editorial Dossier* layout: a generously-sized image on the left, a structured dossier on the right with a 4‑cell fact card and a signed editor's note. Apply only to the homepage hero block; do not touch other surfaces.

**Reference mockup.** `Topcastles Featured Hero.html`, artboard "A · Editorial dossier".

**Pairs with.** "Topcastles Masthead Refresh — Option A" (olive nav, ochre rule). This spec uses the same Option A token set; do not invent new colors.

---

## 1. Anatomy

```
┌────────────────────── section header (serif, ochre rule) ──────────────────────┐
│ From today's index                                              Archive ▸      │
│ A featured entry, drawn from the curated catalogue. Selected by editors.       │
├──────────────────────────────────┬─────────────────────────────────────────────┤
│                                  │ KICKER (uppercase, ochre, tracked)          │
│                                  │ Title (serif, italic ochre period)          │
│                                  │ Where (italic, muted)                       │
│        [ FIGURE 540 ×             │                                             │
│          ~405 px,                 │ Lede paragraph (serif body)                 │
│          4:3, plate stamp ]       │ Continuation paragraph                      │
│                                  │                                             │
│  Caption row beneath:             │ ┌──── 4-cell fact card ────────────────┐  │
│   B Name, view.    © Source       │ │ Editorial │ Visitor │ Period │ Type │  │
│                                  │ │ ★XXIX/1000│ 4.71/5  │ 13th c.│ Tidal│  │
│                                  │ │ scholarly │ 8,140   │ rebuilt│ islet│  │
│                                  │ │ rank      │ ratings │ 1932   │      │  │
│                                  │ └──────────────────────────────────────┘  │
│                                  │                                             │
│                                  │ ┃ "Editor's pull quote …"                  │
│                                  │ ┃                          — J. Marwick    │
│                                  │ ┃                            CONTRIBUTING  │
│                                  │ ┃                            21 April 2026 │
│                                  │                                             │
│                                  │ ─── Read full entry ▸    ★ Save  ⌖ Map  ↪︎ │
└──────────────────────────────────┴─────────────────────────────────────────────┘
```

Two columns at desktop: **`540px 1fr`** with **32 px gap**, top-aligned.

---

## 2. Tokens (reuse Option A palette — do not redefine)

These should already exist from the masthead spec. If not, add to `:root`.

```css
--ink-bg:        #0E1320;   /* page surface (dark mode) */
--ink-bg-2:      #0B101C;   /* deeper inset / hairline edges */
--ink-card:      #141B2C;   /* card / cell fill */
--ink-line:      #1d2434;   /* hairline rule */
--ink-line-2:    #2a3550;   /* card border */
--text-1:        #F2EAD3;   /* primary, headings */
--text-2:        #E8E2D2;   /* body emphasis */
--text-3:        #C5C0AF;   /* body */
--text-4:        #9AA8BD;   /* italic captions, where line */
--text-5:        #7A8AA0;   /* meta, captions */
--text-6:        #5e6a82;   /* placeholders / dates in sig */
--ochre:         #C9863F;   /* the only accent */
--ochre-soft:    #C9B98F;   /* warm muted gold for caption B-tag */
```

Light-mode variants are out of scope for this round (mirror the masthead spec's light tokens later).

---

## 3. Typography

| Element | Family | Weight | Size | Line | Tracking | Color |
|---|---|---|---|---|---|---|
| Section head ("From today's index") | Source Serif 4 | 600 | 22 px | 1.2 | -.005em | `--text-1` |
| Section head "Archive ▸" | Inter | 500 | 11 px | 1 | .08em UC | `--ochre` |
| Section sub | Source Serif 4 *italic* | 400 | 13.5 px | 1.5 | 0 | `--text-4` |
| Kicker ("21 April · Featured entry № 042") | Inter | 600 | 11 px | 1 | .12em UC | `--ochre` |
| Title ("Eilean Donan.") | Source Serif 4 | 500 | 32 px | 1.1 | -.012em | `--text-1` |
| — period glyph in title | Source Serif 4 *italic* | 500 | 32 px | — | — | `--ochre` |
| Where line | Source Serif 4 *italic* | 400 | 14 px | 1.4 | 0 | `--text-4` |
| Body paragraph | Source Serif 4 | 400 | 15 px | 1.62 | 0 | `--text-3` |
| Body — entry name in lede | Source Serif 4 | 600 | 15 px | — | — | `--text-1` |
| Fact-card label | Inter | 600 | 10 px | 1 | .12em UC | `--text-5` |
| Fact-card value (numeric) | Source Serif 4 | 600 | 18 px | 1.1 | 0 | `--text-1` |
| Fact-card value (text, e.g. "Tidal islet") | Source Serif 4 | 600 | 14 px | 1.1 | 0 | `--text-1` |
| Fact-card unit/denominator | Inter | 500 | 11 px | — | .02em | `--text-5` |
| Fact-card sub | Source Serif 4 *italic* | 400 | 11.5 px | 1.3 | 0 | `--text-4` |
| Editor's pull quote | Source Serif 4 *italic* | 400 | 14.5 px | 1.55 | 0 | `--text-2` |
| Signature name | Source Serif 4 *italic* | 600 | 13 px | 1.4 | 0 | `--text-1` |
| Signature role | Inter | 500 | 10 px | 1.4 | .08em UC | `--text-4` |
| Signature date | Inter | 400 | 10.5 px | 1.4 | 0 | `--text-6` |
| Caption — B name | Inter | 600 | 11 px | 1.5 | 0 | `--ochre-soft` |
| Caption — body | Inter | 400 | 11 px | 1.5 | 0 | `--text-5` |
| Read-more link | Inter | 600 | 13 px | 1 | 0 | `--ochre` |
| Action links (★ Save, ⌖ On the map) | Inter | 400 | 12 px | 1 | 0 | `--text-4` |

UC = uppercase. Italics are stylistic — never substitute oblique.

---

## 4. Layout & spacing

### Section wrapper
- Inherits homepage container (max-width 1180–1240 px).
- `padding-top: 28px; padding-bottom: 36px;` if standalone; otherwise rely on the surrounding section rhythm.
- Section head has a **2 px solid `--ochre` underline** with `padding-bottom: 6px`. This rule is the same one used for all section heads — do **not** make this hero special.
- 18 px gap between section sub and the two-column grid.

### Two-column grid
```css
display: grid;
grid-template-columns: 540px 1fr;
gap: 32px;
align-items: start;
```

### Image (left column)
- `aspect-ratio: 4 / 3;` (≈ 540 × 405 px)
- `border: 1px solid var(--ink-line-2);`
- Subtle bottom-darkening overlay so a "plate stamp" stays legible:
  ```css
  background:
    linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,.45) 100%),
    [actual photo as background-image];
  ```
- **Plate stamp** (e.g. `PLATE 03 · 2024`): bottom-left, 14 px from edge, `padding: 5px 9px`, `background: rgba(0,0,0,.35)`, `border: 1px solid rgba(255,255,255,.12)`, Inter 600 / 10.5 px / .12em uppercase, color `rgba(242,234,211,.78)`.
- **Caption row** beneath the figure: flex, `justify-content: space-between`, `padding: 8px 2px 0`. Left = bold name + view description, right = italic source/credit.

### Right column (dossier) — vertical rhythm
| Block | Margin-top |
|---|---|
| Kicker | 0 (flush with image top) |
| Title | 8 px (after kicker) |
| Where | 4 px (after title) |
| First paragraph | 14 px |
| Subsequent paragraphs | 12 px |
| Fact card | 16 px |
| Editor's note | 16 px |
| Read-more strip | 14 px (with 12 px top padding inside it; see below) |

---

## 5. Fact card (the centerpiece)

A 4-cell horizontal grid. Each cell holds a label, a value, and a one-line italic sub.

```html
<div class="fact-card">
  <div class="cell">
    <div class="lbl">Editorial</div>
    <div class="val"><span class="star">★</span>XXIX<span class="unit">/1000</span></div>
    <div class="sub">scholarly rank</div>
  </div>
  <div class="cell">
    <div class="lbl">Visitor</div>
    <div class="val">4.71<span class="unit">/5</span></div>
    <div class="sub">8,140 ratings</div>
  </div>
  <div class="cell">
    <div class="lbl">Period</div>
    <div class="val" style="font-size:14px">13th c.</div>
    <div class="sub">rebuilt 1932</div>
  </div>
  <div class="cell">
    <div class="lbl">Type</div>
    <div class="val" style="font-size:14px">Tidal islet</div>
    <div class="sub">stronghold</div>
  </div>
</div>
```

```css
.fact-card{
  border: 1px solid var(--ink-line-2);
  background: linear-gradient(180deg, var(--ink-card) 0%, var(--ink-bg) 100%);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: stretch;
}
.fact-card .cell{
  padding: 12px 14px;
  border-right: 1px solid var(--ink-line-2);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.fact-card .cell:last-child{ border-right: 0; }

.fact-card .lbl{
  font: 600 10px/1 "Inter", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--text-5);
  margin-bottom: 5px;
}
.fact-card .val{
  font: 600 18px/1.1 "Source Serif 4", serif;
  color: var(--text-1);
}
.fact-card .val .unit{
  font: 500 11px "Inter", system-ui, sans-serif;
  color: var(--text-5);
  margin-left: 3px;
  letter-spacing: .02em;
}
.fact-card .val .star{
  color: var(--ochre);
  font-style: italic;
  font-weight: 500;
  margin-right: 3px;
}
.fact-card .sub{
  font: italic 400 11.5px/1.3 "Source Serif 4", serif;
  color: var(--text-4);
  margin-top: 2px;
}
```

**Critical detail.** Denominators (`/1000`, `/5`) are non-negotiable — they are the entire point of the fact card. The previous bug ("620 / 6.7" floating without unit) is what this card exists to fix. Always render the `.unit` span.

**Editorial value format.** `★XXIX/1000` for top‑10 starred entries; plain Roman numerals (no star) for others. Use lowercase for the prefix span if the entry is not top‑10. Do not switch to Arabic numerals.

---

## 6. Editor's note (pull quote + signature)

```html
<div class="editor-note">
  <div class="q">Few entries draw their power so completely from setting…</div>
  <div class="sig">
    <b>J. Marwick</b>
    <span class="role">Contributing editor</span><br>
    <span class="date">21 April 2026</span>
  </div>
</div>
```

```css
.editor-note{
  border-left: 2px solid var(--ochre);
  padding: 14px 18px;
  background: linear-gradient(90deg, rgba(201,134,63,.08), transparent 70%);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px 22px;
  align-items: end;
}
.editor-note .q{
  font: italic 400 14.5px/1.55 "Source Serif 4", serif;
  color: var(--text-2);
  text-wrap: pretty;
}
.editor-note .q::before{
  content: "\201C";       /* left double quote */
  font-style: normal;
  color: var(--ochre);
  font-size: 28px;
  line-height: 0;
  padding-right: 4px;
  position: relative;
  top: 6px;
}
.editor-note .sig{
  text-align: right;
  font: 400 10.5px/1.55 "Inter", system-ui, sans-serif;
  color: var(--text-5);
  white-space: nowrap;
}
.editor-note .sig b{
  display: block;
  font: italic 600 13px "Source Serif 4", serif;
  color: var(--text-1);
}
.editor-note .sig .role{
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 10px;
  color: var(--text-4);
}
.editor-note .sig .date{ color: var(--text-6); }
```

**Critical detail.** The 2 px ochre left border + the warm horizontal gradient are the identity of this block. Do not flatten the gradient or substitute a solid background — the diffuse wash is what makes it feel printed, not bordered.

---

## 7. Read-more strip

```html
<div class="readmore">
  <div class="left"><a href="…">Read the full entry ▸</a></div>
  <div class="right">
    <a href="…">★ Save</a>
    <a href="…">⌖ On the map</a>
    <a href="…">↪︎ Surprise me</a>
  </div>
</div>
```

```css
.readmore{
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--ink-line);
  display: flex; align-items: center; justify-content: space-between;
  font: 400 12px "Inter", system-ui, sans-serif;
  color: var(--text-4);
}
.readmore .left a{ color: var(--ochre); font-weight: 600; font-size: 13px; text-decoration: none; }
.readmore .left a:hover{ text-decoration: underline; text-underline-offset: 3px; }
.readmore .right{ display: flex; gap: 14px; }
.readmore .right a{ color: var(--text-4); text-decoration: none; }
.readmore .right a:hover{ color: var(--text-1); }
```

---

## 8. Reference HTML skeleton

```html
<section class="featured-entry" aria-labelledby="fe-head">
  <h2 class="sec-head" id="fe-head">
    From today's index
    <a class="more" href="/featured">Archive ▸</a>
  </h2>
  <p class="sec-sub">A featured entry, drawn from the curated catalogue. Selected by the editorial board on a rolling basis.</p>

  <div class="fe-grid">
    <figure class="fe-figure">
      <div class="fe-photo" style="background-image:url('…')">
        <span class="frame-stamp">Plate 03 · 2024</span>
      </div>
      <figcaption>
        <span><b>Eilean Donan, Kintail.</b> View from the south causeway, low tide.</span>
        <span class="credit">© Conchra Trust archive</span>
      </figcaption>
    </figure>

    <div class="fe-body">
      <div class="kicker">21 April · Featured entry № 042</div>
      <h3 class="fe-title">Eilean Donan<em>.</em></h3>
      <div class="fe-where">Kintail, Highland · Scotland</div>

      <p><span class="entry-name">Eilean Donan</span> (<i>Eilean Donnain</i>) is a small tidal island…</p>
      <p>First fortified in the 13th century, the castle has been held in succession by the Mackenzies of Kintail…</p>

      <!-- §5 fact-card -->
      <div class="fact-card"> … </div>

      <!-- §6 editor-note -->
      <div class="editor-note"> … </div>

      <!-- §7 readmore -->
      <div class="readmore"> … </div>
    </div>
  </div>
</section>
```

---

## 9. Light mode

Mirror the dark spec with the Option A light tokens (`--paper`, `--ink`, etc.). Only adjustments:
- `.fe-photo` plate stamp: switch to `background: rgba(255,252,243,.85)`, dark text, ochre border.
- `.fact-card` background: `linear-gradient(180deg, var(--paper-2), var(--paper))`.
- `.editor-note` gradient: `linear-gradient(90deg, rgba(168,51,30,.06), transparent 70%)` (heraldic red wash on the cream background reads warmer than ochre).
- `.editor-note .q::before` quote: keep ochre.

---

## 10. Responsive

- **≥ 1100 px:** the 540 px / 1fr split as specified.
- **820 – 1099 px:** collapse to single column. Image full-width at `aspect-ratio: 16/9`. Dossier flows beneath. Fact card stays 4-up.
- **≤ 819 px:** fact card collapses to **2 × 2** grid (`grid-template-columns: repeat(2,1fr)`). Editor's note signature drops below the quote (single column). Read-more strip wraps; `.right` becomes a horizontal scrollable row or wraps to a new line.

---

## 11. Accessibility

- `<figure>` + `<figcaption>` is the correct semantic for the image + caption pair.
- The fact card cells should each have `aria-label` if the value alone isn't self-describing — e.g. `<div class="val" aria-label="Editorial rank 29 of 1000">…</div>`. Roman numerals are not screen-reader friendly; provide an Arabic-numeral aria-label.
- Editor's note: wrap the quote in `<blockquote>` and the signature in `<cite>` (overriding default italics is fine).
- Star glyph in fact card: `aria-hidden="true"`.
- Color contrast: every text/background pair listed above passes WCAG AA at the specified sizes against `--ink-bg`. Verify before merge.
- Link focus styles: 2 px outline in `--ochre` with 2 px offset; do not rely on hover alone.

---

## 12. Definition of done

- [ ] Two-column grid `540px 1fr` at desktop, image left.
- [ ] Photograph fills 4:3 with plate stamp bottom-left, caption row beneath.
- [ ] Kicker → Title → Where → 2 prose paragraphs in the right column.
- [ ] 4-cell fact card with **Editorial / Visitor / Period / Type**, all values rendered with their denominators where applicable.
- [ ] Editor's note has the 2 px ochre left border, the horizontal warm gradient, the curly quote, and a 3-line signature (name, role uppercase, date).
- [ ] Read-more strip with primary "Read the full entry ▸" link in ochre, secondary actions to the right.
- [ ] Section head uses the 2 px ochre underline (consistent with other section heads).
- [ ] Responsive collapses cleanly at 1099 and 819 px.
- [ ] Light mode mirrors with the cream tokens and the heraldic red editor-note wash.
- [ ] All Inter weights load (400, 500, 600, 700); all Source Serif 4 italics load.
- [ ] Lighthouse a11y score ≥ 95 on the homepage.

---

## 13. Out of scope

Do **not** in this round:
- Touch the rankings table, the period table, or the country list.
- Add new actions to the read-more strip beyond the four listed (Read / Save / On the map / Surprise me).
- Restyle other section heads.
- Change the masthead — that's a separate ticket.

If anything is ambiguous, default to the visual reference at `Topcastles Featured Hero.html` artboard A.
