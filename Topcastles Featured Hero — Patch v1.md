# Topcastles — "From today's index" Hero · Patch v1
## Follow-up implementation guide for Claude Code

**Scope.** A focused patch on the already-implemented Editorial Dossier hero block. Closes seven small gaps from the first round; does **not** restyle the section, masthead, sidebar, or any other surface.

**Reference mockup.** `Topcastles Featured Hero.html`, artboard "A · Editorial dossier".
**Original spec.** `Topcastles Featured Hero — Option A Spec.md` (still authoritative for tokens, type, and structure — only the items below change).

---

## 1. Patch list

### 1.1  Add the editor's note block
**Status:** missing entirely.
**Where:** between the fact card and the read-more strip in the right column.
**What:** the pull-quote + 3-line signature block exactly as specified in §6 of the original spec — 2 px ochre left border, horizontal warm gradient `linear-gradient(90deg, rgba(201,134,63,.08), transparent 70%)`, curly-quote glyph in ochre.
**Content (default for Akershus):**
> "Akershus has held Oslo's harbour against siege for seven centuries without once falling to a foreign army. Few entries in the index can say the same — and fewer still do so quietly."

Signature: **A. Lien** / CONTRIBUTING EDITOR / 2 May 2026.
**Acceptance:** the gradient is *diffuse* (not a flat tint); the left border is exactly 2 px solid `--ochre`; the curly quote uses `\201C`, not a straight `"`.

### 1.2  Move the figure caption row outside the image
**Status:** stamp + caption are stacked *inside* the photo as one block.
**What to change:**
- Keep only the **plate stamp** ("PLATE 76 · 2026") inside the photo, bottom-left, with its bordered tile (per §4 of original spec).
- Move the **bold name + view description + © credit** to a flex row *beneath* the figure: `padding: 8px 2px 0`, `justify-content: space-between`. Left = `<b>Akershus, Oslo.</b> View from the harbour, late winter.` Right = `<span class="credit">© Akershus arkiv</span>`.

### 1.3  Kicker on a single line
**Status:** "2 MAY · FEATURED ENTRY № LXXVI" wraps to two lines and reads as a heading.
**What to change:**
- Replace Roman numerals with Arabic — see §1.4.
- Force single line with `white-space: nowrap;` and reduce kicker font-size to **10.5 px** if needed at the current column width.
- The kicker is **one line of meta**, never a heading. It must not visually compete with the title beneath it.

### 1.4  Switch entry numbers to Arabic
**Status:** "Entry № LXXVI" reads as costume rather than catalogue.
**Decision:** Roman numerals are reserved for the **editorial rank only** (e.g. `★ XXIX/1000`) — they signal the editorial board's hand. Catalogue numbers and dates should be Arabic for legibility.
**What to change:**
- Kicker: `2 May · Featured entry № 76`.
- Plate stamp: `Plate 76 · 2026`.
- Anywhere else "Entry №" appears in a list, header, or URL slug → Arabic.
- **Keep** Roman numerals in the editorial-rank cell of the fact card (`★ LXXVI/1000` *or* `★ 76/1000` — see §1.5).

### 1.5  Reconcile editorial rank format
**Decision needed.** Pick one and apply everywhere:
- **Option a (current):** Roman numerals for editorial rank → `★ LXXVI/1000`. Pros: visually distinct from visitor rating; reinforces "by editors". Cons: hostile to screen readers; a rank of 76 is hard to read at a glance.
- **Option b (recommended):** Arabic editorial rank → `★ 76/1000`. The star + denominator already separate it from the visitor rating; you don't need the Roman numerals to do that work too.

If keeping Roman: ensure every `★ XXIX/1000`-style value carries an `aria-label="Editorial rank 29 of 1000"` (per §11 of original spec). If switching to Arabic: drop the aria-label fallback.

### 1.6  Resolve the fact-card overflow (drop "Period" cell)
**Status:** "Period — Rebuild/R…" is truncated; the 4-cell card doesn't fit the right column.
**What to change:** drop **Period** and **Type** from the fact card and move them to a one-line metadata strip *between the where-line and the prose paragraphs*. The fact card becomes 2 cells: **Editorial** and **Visitor**, each given more breathing room.

```html
<div class="entry-meta-strip">
  <span><b>Period</b> 13th c. · rebuilt 1932</span>
  <span><b>Type</b> Stronghold on tidal islet</span>
  <span><b>Country</b> Norway</span>
</div>
```

```css
.entry-meta-strip{
  margin: 4px 0 14px;
  padding: 8px 0 10px;
  border-bottom: 1px dotted var(--ink-line-2);
  font: italic 400 12.5px/1.5 "Source Serif 4", serif;
  color: var(--text-4);
  display: flex; flex-wrap: wrap; gap: 4px 22px;
}
.entry-meta-strip b{
  font: 600 10px "Inter", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--text-5);
  font-style: normal;
  margin-right: 4px;
}
```

```css
.fact-card{ grid-template-columns: repeat(2, 1fr); }
.fact-card .cell{ padding: 14px 18px; } /* slightly more generous now there are only two */
.fact-card .cell .val{ font-size: 22px; } /* the values can breathe */
```

**Acceptance:** the fact card never truncates at any viewport ≥ 820 px; below that, it stays 2-up but stacks vertically inside its cells if needed.

### 1.7  Inline the read-more strip actions
**Status:** "★ Save" sits beside "Read the full entry ▸" but "↪︎ Surprise me" wraps to a second row.
**What to change:** all secondary actions on a single right-aligned flex row, with `flex-wrap: wrap` only as a last resort. The `.right` group: `display: flex; gap: 16px;`. If the row would overflow on narrow widths, drop "On the map" before wrapping "Surprise me".

---

## 2. Cross-cutting fixes (from your latest notes)

### 2.1  "Archive" link — remove or repurpose
**Status:** the "Archive ▸" link in the section head currently points to /top-1000, duplicating the nav.
**Decision needed:**
- **(a)** Remove it. The section head loses its right-side affordance — clean.
- **(b)** Repurpose to a real archive — a paginated list of past Featured Entries with their dates and editor signatures (e.g. `/featured/archive`). This is the only version that earns the link.
- **Recommended:** **(b)**, but only when the archive page actually exists. Until then, **(a)**: remove the link entirely. Don't ship a link that resolves to a duplicate of Top 1000.

If implementing (b), the archive page is a separate ticket — list of `<date> · <entry name> · <editor signature>` rows, reverse-chronological, with the current entry pinned to the top.

### 2.2  "Surprise me" duplicates "Castle of the Week / Discover the List"
**Status:** "↪︎ Surprise me" in the read-more strip and the "DISCOVER THE LIST" CTA in the Castle of the Week sidebar trigger the same behaviour.
**Decision:** keep one, remove the other.
**Recommended:** keep **"Surprise me" in the read-more strip** (it sits in context with the entry the user is already reading, giving "show me another like this" a clear meaning). Remove "DISCOVER THE LIST" from the Castle of the Week card; the card's name and link to the entry are sufficient.
**Rationale:** the read-more strip is the natural place for "next entry" behaviour. The sidebar CTA was inherited from a draft when there was no in-context Surprise me.

### 2.3  "★ Save" icon mismatch with the Favorites menu icon
**Status:** the read-more strip uses `★` (filled star); the masthead Favorites icon is a different glyph.
**Decision:** the Favorites system needs **one** icon, used identically in three places: (a) the masthead nav icon, (b) the per-entry "Save" affordance, (c) the Favorites page header.
**Recommended canonical glyph:** an outline bookmark `🕮︎`-style **outline star** when not saved, **filled star** when saved. Use the same SVG asset in all three places — do not mix unicode glyphs with SVG.
**Acceptance:** open the homepage, the Favorites page, and the masthead — the same icon, same weight, same size, same color is used in all three. Default state is outline; saved state is filled `--ochre`.

---

## 3. Definition of done (patch v1)

- [ ] Editor's note block present, with 2 px ochre left border, warm horizontal gradient, curly quote, and 3-line signature.
- [ ] Figure caption row sits outside the image; only the plate stamp remains inside.
- [ ] Kicker reads "2 May · Featured entry № 76" on a single line.
- [ ] All catalogue/date numerals are Arabic; Roman numerals reserved for editorial rank only (or eliminated entirely if you take §1.5b).
- [ ] Fact card is 2-cell (Editorial / Visitor); never truncates; values rendered with denominators.
- [ ] Period / Type / Country move to the italic metadata strip above the prose.
- [ ] Read-more strip actions inline on one row; "Surprise me" no longer wraps.
- [ ] Archive link removed (or wired to a real archive page if §2.1b is implemented).
- [ ] "DISCOVER THE LIST" CTA removed from Castle of the Week sidebar.
- [ ] Favorites uses one canonical SVG icon across masthead, read-more strip, and Favorites page.
- [ ] Both light and dark modes verified; light-mode fact card uses the `--ochre-soft` border per the original spec §9.

---

## 4. Out of scope

Do **not** in this patch:
- Touch the fact-card layout below 820 px (existing spec §10 still holds).
- Restyle "About this list", the rankings, period table, or country list.
- Change the masthead, nav, or footer.
- Rebuild the Favorites page itself (only the icon, in three places).

If anything is ambiguous, refer to the original spec; if the original is silent, default to the visual at `Topcastles Featured Hero.html` artboard A.
