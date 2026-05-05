# Patch addendum — Featured entry, adaptive image height + adaptive extract

Replaces the current fixed 2-column featured-entry layout with one that adapts to image height **and** lets the Wikipedia extract grow to fill the available space alongside a tall image instead of being truncated to a fixed length.

Source-of-truth mockup: `Topcastles Featured Adaptive Regimes.html`.

Implemented through the featured-entry bead trail: `topcastles-kfiz`, `topcastles-gi9e`, and `topcastles-j60a`. The adaptive regime landed in `8343513`.

---

## Two changes in one patch

1. **Layout regimes** — image left (500 px), dossier right; one of two regimes based on image height.
2. **Adaptive extract length** — the Wikipedia extract clamps to *whatever still fits* in the right column once the dossier-core has rendered, instead of a fixed character count + "Read more →".

---

## 1 · Layout regimes

| Regime | When | Editor's note slot | Action row slot |
|---|---|---|---|
| **Short** | image height `≤ 360` | Full-width band, left ⅔ | Full-width band, right ⅓ |
| **Medium / Tall** | image height `> 360` | Right column, under dossier-core | Full-width band (1-col) |

Stamp the wrapper at render time: `data-regime="short"` or `data-regime="medium"`. Single CSS rule per regime; note's DOM position is constant (last grid child); only `grid-column` and the band template change.

```css
.featured-grid { display: grid; grid-template-columns: 500px 1fr; column-gap: 36px; }
.featured-band { grid-column: 1 / -1; margin-top: 18px; padding-top: 18px;
                 border-top: 1px solid var(--line); display: grid; column-gap: 36px; }

.featured-grid[data-regime="medium"] .featured-note { grid-column: 2; }
.featured-grid[data-regime="medium"] .featured-band { grid-template-columns: 1fr; }

.featured-grid[data-regime="short"]  .featured-note { grid-column: 1 / -1; }
.featured-grid[data-regime="short"]  .featured-band { grid-template-columns: 2fr 1fr; }
```

---

## 2 · Adaptive extract length

The Wikipedia extract is currently truncated to a fixed character count, ending in "…" + "Read more →". This wastes space when the image is tall (right column has plenty of room) and overflows when the image is short (right column has little room).

**The rule.** Render the full extract into a clamped container; size the container to fill whatever vertical space is available next to the image (Medium / Tall regime) or to a sensible default (Short regime); show the "Read more →" link only when the clamp actually hides text.

### Markup

```html
<div class="featured-extract" data-clamp>
  <p class="extract-body">[full extract paragraph, no truncation server-side]</p>
  <a class="extract-more" href="…">Read more →</a>
</div>
```

The server should send the **complete** Wikipedia extract — not a pre-truncated one. The clamp is a CSS+JS concern.

### CSS

```css
.featured-extract { position: relative; }
.featured-extract .extract-body {
  margin: 0 0 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* line-clamp set per regime via custom property */
  -webkit-line-clamp: var(--extract-lines, 6);
  line-clamp: var(--extract-lines, 6);
}
.featured-extract.is-clamped .extract-more { display: inline; }
.featured-extract:not(.is-clamped) .extract-more { display: none; }

/* Defaults per regime — JS may override */
.featured-grid[data-regime="medium"] .featured-extract { --extract-lines: 6; }
.featured-grid[data-regime="short"]  .featured-extract { --extract-lines: 4; }
```

### JS — measure available space, set the clamp

After layout, on a tall image, the right column has more height to fill than the dossier-core needs. The extract should grow to consume the slack. One small script:

```js
function fitFeaturedExtract() {
  document.querySelectorAll('.featured-grid').forEach(grid => {
    const regime = grid.dataset.regime;
    const image  = grid.querySelector('.featured-image');
    const dossier = grid.querySelector('.featured-dossier');
    const extract = grid.querySelector('.featured-extract .extract-body');
    if (!image || !dossier || !extract) return;

    if (regime === 'short') {
      // No expansion — keep the small default
      grid.style.setProperty('--extract-lines', '4');
    } else {
      // Available height in the right column = image height (the column we want to match)
      // Height already used by dossier-core minus the extract itself
      const imageH = image.offsetHeight;
      const dossierH = dossier.offsetHeight;
      const extractH = extract.offsetHeight;
      const lineH = parseFloat(getComputedStyle(extract).lineHeight) || 22;

      // Slack is how many extra extract lines we could fit before the right column matches the image
      const slack = Math.max(0, imageH - (dossierH - extractH));
      const fitLines = Math.max(4, Math.floor(slack / lineH) - 1); // -1 for the "Read more" line + breathing room
      grid.style.setProperty('--extract-lines', String(Math.min(fitLines, 30))); // cap at 30 to avoid runaway
    }

    // Toggle is-clamped based on whether content overflows after the clamp settles
    requestAnimationFrame(() => {
      const wrapper = extract.closest('.featured-extract');
      const isClamped = extract.scrollHeight > extract.clientHeight + 1;
      wrapper.classList.toggle('is-clamped', isClamped);
    });
  });
}

window.addEventListener('load', fitFeaturedExtract);
window.addEventListener('resize', () => requestAnimationFrame(fitFeaturedExtract));
new ResizeObserver(fitFeaturedExtract).observe(document.querySelector('.featured-image'));
```

Notes:

- The `lineH` fallback (22) matches the current extract line-height. If the design tokens change, recompute from `getComputedStyle` (already done above).
- The `-1` slack adjustment leaves a single line of breathing room above the action row / next block.
- Cap at 30 lines so a freakishly tall image doesn't render the entire extract.
- Floor at 4 lines so the extract is never shorter than what currently appears on Short.

### Behaviour summary

- Short image → 4 clamped lines, "Read more →" visible if the extract is longer.
- Medium image (500 × 500) → ~6–8 lines, "Read more →" if needed.
- Tall image (500 × 1500) → ~20+ lines, "Read more →" only if the full extract still doesn't fit.
- Mobile (< 760 px) — single column, no clamping; render the full extract or a simple 6-line clamp with "Read more →" — your call, no measurement needed.

---

## Anti-patterns

- ❌ Don't truncate server-side. Send the full extract; let the clamp do the work.
- ❌ Don't keep the old fixed-character cut + "…". The clamp + ellipsis is the new behaviour.
- ❌ Don't letterbox short images.
- ❌ Don't crop tall images by default.
- ❌ Don't change the 500 px image width.
- ❌ Don't add new tokens.

---

## Mobile (< 760 px)

Single column. Order: image → caption → dossier-core → editor's note → actions. No clamp measurement; use a flat 8-line clamp with `Read more →`.

---

## Verification

1. Short image (500 × 300) → `data-regime="short"`, extract clamped to 4 lines, `Read more →` visible.
2. Medium image (500 × 500) → `data-regime="medium"`, extract grows to roughly fill the right column above the editor's note; `Read more →` shows only if content overflows.
3. Tall image (500 × 1500) → same regime as Medium, extract grows much longer (20+ lines) so the right column reaches the image's bottom; `Read more →` only if the full Wikipedia extract still won't fit.
4. Resize the window — extract reflow recomputes on resize and on image-load.
5. `npm test`, `npm run build`, `npm run test:smoke`.

The implementation is closed in Beads; keep this addendum as design history unless a new regression bead is opened.

# Summary

1. Layout regimes — Short (≤360 px image) puts editor's note + actions in a 2:1 band underneath; Medium/Tall keeps the note in the right column with a single-cell band for actions.

2. Adaptive extract length — server sends the full Wikipedia extract; CSS clamps via -webkit-line-clamp driven by a --extract-lines custom property; a small JS function measures available slack between image height and dossier-core height, divides by line-height, and sets the clamp so the right column reaches the image's bottom. Floor 4 lines, cap 30. is-clamped class only when content actually overflows, so "Read more →" hides itself when the full extract fits.

The script also runs on resize and on a ResizeObserver watching the image, so late-loading thumbnails reflow correctly.
