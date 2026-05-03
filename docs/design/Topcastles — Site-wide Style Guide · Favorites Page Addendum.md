# Topcastles — Site-wide Style Guide · Favorites Page Addendum

This addendum supplements `Topcastles Site-Wide Style Guide.md` and the Light-mode addendum. It covers the **My Favorites** page, which is currently the weakest IA + design surface on the site. The page violates the system in several ways and — more importantly — it doesn't work *as a favorites page*: you cannot see your favorites without clicking into a set.

The notes below are split into two parts:

- **Part A — IA & functionality.** What's wrong with the page as a tool. Fix this first; the styling fixes mean nothing if the page isn't useful.
- **Part B — Style violations.** Token, layout, and grammar fixes that bring it in line with the rest of the site.

---

## Part A · IA & functionality

### A1. The page is missing its primary content

A "Favorites" page should open with **the user's favorited castles** — not with a list of *containers* for those castles. The current page shows three set names (`favs`, `set1`, `set2`) and a count, with no castles visible until you drill in.

**Fix.** The page is a single column today; promote it to a **two-pane layout**:

| Pane | Width | Contents |
|---|---|---|
| **Left rail — Sets** | 240 px | Sets list (`favs`, `set1`, `set2`) + "+ New set" inline; share-link affordance collapsed to a small "Share" link at the rail foot |
| **Right pane — Selected set** | flex | Castle entries in the selected set, rendered as the standard Top-1000 row (rank · thumbnail · name · country · score · ★) |

Default selection: the first set, or the set named `favs` if it exists. The URL carries the selection (`/favorites?set=favs`) so the share link is meaningful.

### A2. "Share link" is over-prioritised

The share-link block is the first thing on the page and consumes more vertical space than any set. It is a *secondary* affordance — the user came here to see their favorites, not to copy a URL.

**Fix.** Demote to a subtle action at the foot of the left rail:

```
─────────────────────────
  Share these favorites →
─────────────────────────
```

Click reveals the URL + copy button in a small popover, or routes to a `/favorites/share` modal. The full URL with token never sits on the page by default — it's noise, and exposing the token in a screenshot is mildly bad hygiene.

The explanatory sentence ("Your favorites are stored in this browser…") moves into a `<details>` summary labelled **"Where are my favorites stored?"** at the bottom of the rail. It's important context, but reading it every visit is friction.

### A3. The set entries are dead surfaces

Each set card is a large rectangle with a name, a count, and a trash icon. There is no:
- Preview of what's inside (thumbnails, top-ranked castle in the set, average score)
- Rename affordance
- Reorder affordance
- Indicator that the card is clickable

**Fix.** Render each set in the rail as a row, not a card:

```
┌─────────────────────────┐
│ ▸ favs            2  •  │   ← • = unsaved-changes dot, hidden when clean
│   Burg Eltz · Bodiam …  │   ← top-2 names, dimmed
├─────────────────────────┤
│ ▸ set1            2     │
│   Krak des Chev. · …    │
├─────────────────────────┤
│ ▸ set2            2     │
│   …                     │
├─────────────────────────┤
│ + New set               │
└─────────────────────────┘
```

- **Hover** reveals the rename pencil and trash on the right.
- **Click** selects the set and updates the right pane.
- **Drag** by the row gutter reorders sets (low priority — only if drag-reorder is already in the codebase).

The "+ New set" affordance lives at the bottom of the list, inline. The freestanding `New set name` input + `Create set` button block above the sets is removed — it's a modal masquerading as a form.

### A4. Trash is destructive without confirmation

The current trash icon presumably deletes a whole set on click. **Require confirmation** — a small inline confirm strip ("Delete set? [Cancel] [Delete]") that replaces the row, not a browser `confirm()` dialog. Sets are user data; loss is unrecoverable.

### A5. Empty state

If the user has no favorites at all, the page should not render the sets rail / right pane chrome. Show a single editorial empty state:

> **You haven't saved any favorites yet.**
> Tap the ★ on any castle in the index to start a list.

Centered, italic, `--text-4`, on plain paper. One link below: **Browse Top 1000 →**.

### A6. Ranking inside a set

Inside a set, castles should show their **rank in the set** (1, 2, 3…) *and* their global Top-1000 rank, in the same dual-rank grammar used elsewhere on the site. This makes the set feel like an editorial sub-list, not a bag.

```
Rank · ★ Top-1000 · Castle · Country · Score
  1     ★ 4        Krak des Chevaliers · SY · 8.6
  2     ★ 77       Burg Eltz · DE · 7.0
```

### A7. Sort, filter, export

Below the right pane, three quiet text actions, separated by middle dots:

```
Sort: rank · score · alpha · added     ·     Export CSV     ·     Print
```

No buttons — these are `<a>` tags styled as inline links, the same grammar as the article-foot links elsewhere on the site.

---

## Part B · Style violations

### B1. The set-card colour is wrong

The set cards (`favs`, `set1`, `set2`) currently use a **purple-tinted grey** for the title (`set1`, `set2` read as a desaturated mauve in the screenshot). The system has no purple. The set name should be `--ochre` in dark mode, `--text-1` in light mode (the title is structural, not accent — ochre on `favs` is fine but every title in `--ochre` is over-coloring).

**Fix.** Set name uses `--text-1`. The optional accent — a coloured leading rule, ★ glyph, or count badge — uses `--ochre`. Pick **one** accent per row.

### B2. Cards are too tall and too rounded

Each card is ~110 px tall for two lines of content, with `border-radius: 8px` and a heavy `--ink-card` fill that floats off the page. The system uses **square corners** (parent guide §6) and **hairline borders on flat paper** (parent guide §3).

**Fix.**

```css
.fav-set-row{
  display: grid;
  grid-template-columns: 16px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ink-line);
  background: transparent;        /* paper, not card */
  border-radius: 0;
  cursor: pointer;
}
.fav-set-row[aria-current="true"]{
  background: var(--ink-card);
  box-shadow: inset 3px 0 0 var(--ochre);
}
.fav-set-row .name{
  font: 600 14px/1.2 "Source Serif 4", serif;
  color: var(--text-1);
}
.fav-set-row .preview{
  font: italic 400 12.5px/1.3 "Source Serif 4", serif;
  color: var(--text-4);
  margin-top: 2px;
}
.fav-set-row .count{
  font: 500 11px/1 "Inter", system-ui, sans-serif;
  color: var(--text-5);
  letter-spacing: .08em;
  text-transform: uppercase;
}
```

### B3. The share-link input uses a coloured "Share link" floating label

The current input has a green/teal floating label (`Share link`) — a Material Design pattern that doesn't belong in a reference-work system. Once the share affordance moves to the rail foot (A2), the input lives inside a popover with a plain top-aligned label:

```
SHARE LINK
[ http://… ]    [ Copy ]
```

Label: `--text-5`, 10.5 px, uppercase, `letter-spacing: .12em`. No floating animation.

### B4. The "+ Create set" button is a pill

Pill buttons are forbidden by parent guide §6. Replace with the standard square button:

```css
.btn-secondary{
  background: var(--ink-card);
  border: 1px solid var(--ink-line-2);
  color: var(--text-2);
  padding: 8px 14px;
  border-radius: 0;
  font: 500 12px/1 "Inter", system-ui, sans-serif;
  letter-spacing: .04em;
  cursor: pointer;
}
.btn-secondary:hover{ border-color: var(--ochre); color: var(--text-1); }
```

The `+` glyph stays, but rendered as a typographic plus, not an icon: `<span aria-hidden="true">+</span>` with the same weight as the label text.

### B5. Trash icon is a Material `delete` glyph

Replace with the same hairline glyph set used elsewhere on the site (the bookmark / paper-plane / sun icons in the masthead). If no system icon for delete exists, use the typographic ✕ at `--text-5`, switching to `--heraldic-red` on hover. **Do not** introduce a new icon family for this one action.

### B6. The page head is too small

`My Favorites` is rendering at the same size as a section head (~16 px serif). It should be a **page head** per the light-mode addendum §3:

```css
.page-head{
  font: 600 32px/1.15 "Source Serif 4", serif;
  letter-spacing: -.012em;
  border-bottom: 2px solid var(--ochre);
  padding-bottom: 8px;
  margin: 0 0 24px;
}
```

The current 1 px ochre underline below `My Favorites` should become 2 px to match every other page head on the site.

### B7. Footer is leaking column gaps

In the screenshot, the footer's three columns (`BROWSE` / `DATA & API` / `ABOUT`) are too far apart — the right column is pushed against the right margin. The Favorites page sets a narrow content column for the cards, but the footer should always span the full content width per parent guide §11.

**Fix.** Footer is rendered outside the main content container, full width, with its own internal grid. Its layout never reflows based on the page above it.

### B8. The masthead nav-bar tab-active rule is missing here

On the live page, no nav item is marked active — `My Favorites` lives outside the primary nav, but the bookmark icon in the right utility cluster *should* be in active state when this page is open (icon in `--ochre`, the others in `--nav-fg-muted`).

```css
.utility-icon[aria-current="page"]{ color: var(--ochre); }
```

---

## Part C · Sweep checklist for the Favorites page

1. Two-pane layout: rail + right pane. Default to first set.
2. Demote share link to rail foot popover; remove from page top.
3. Promote set rows to inline rows with previews; remove the floating cards.
4. Inline "+ New set" at the rail foot; remove the standalone Create-set form.
5. Confirm-on-delete inline strip; never raw browser dialog.
6. Empty state for zero-favorites users.
7. Dual rank (set rank + Top-1000 rank) inside the right pane.
8. Sort / Export / Print as inline links below the right pane.
9. All buttons square; all colours from the system tokens; no purple, no pill, no Material icons.
10. `My Favorites` rendered as a page head (2 px ochre rule).
11. Bookmark utility icon active when on `/favorites`.

If only one fix lands, make it **A1** — show the user their castles. Everything else is downstream of that.


# Summary

## Part A — IA & functionality (the bigger issue):

1. The page shows containers, not contents — open with the user's actual castles in a two-pane layout (sets rail + right pane).
2. Share link is over-prioritised — demote to a rail-foot popover.
3. Set entries are dead surfaces — convert to inline rows with previews, hover-to-rename, click-to-select.
4. Confirm-before-delete (inline strip, not a browser dialog).
5. Editorial empty state for zero-favorites users.
6. Dual rank inside a set (set rank + Top-1000 rank, matching the rest of the site).
7. Sort / Export / Print as quiet inline links.

## Part B — Style violations:

1. Purple-tinted set names → --text-1; ochre is one accent per row, not the title color.
2. Floating rounded cards → flat hairline rows on paper, square corners.
3. Floating-label share input → uppercase static label.
4. Pill "+ Create set" button → square secondary button.
5. Material delete icon → hairline glyph from the existing icon set.
6. Page head too small → 32 px serif + 2 px ochre rule.
7. Footer column gaps leaking from the page's narrow column.
8. Bookmark utility icon should be active when on /favorites.