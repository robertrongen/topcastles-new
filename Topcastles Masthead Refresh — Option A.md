# Topcastles — Masthead & Nav Refresh

**Style guide for Option A: Olive band, ochre rule**

This document specifies the visual changes required to replace the current bright‑orange navigation band with a desaturated olive band and a warm ochre underline. Scope is limited to the **masthead row** and the **primary navigation row** that appear on every page.

---

## 1. Design intent

The current orange nav band reads as e‑commerce/utility chrome. Topcastles is positioned as an *editorial atlas*, not a shop. Option A re‑skins the nav to a museum‑plate register:

- **Wordmark gains presence**, becomes the dominant element of the masthead.
- **Tagline** is reframed as an editorial subtitle ("An editorial atlas of medieval fortifications, ranked by editors and visitors").
- **Search field** is restyled to a hairline‑bordered input with a small SEARCH affordance, not a CTA button.
- **Primary nav** moves from a saturated orange band to a dark olive (`#2D3526`) band with a subtle ochre rule underneath.
- **Active state** is communicated by a 2 px ochre underline + faint background tint, not by a filled pill.

Net effect: the chrome recedes, content gains weight, and the brand reads as serious reference rather than tourism.

---

## 2. Color tokens

Add or update the following CSS variables. **Existing tokens elsewhere on the site should not be changed in this round.**

```css
:root {
  /* ——— masthead surface ——— */
  --mast-bg:        #0B101C;   /* deep ink — masthead background */
  --mast-rule:      #1F2840;   /* hairline below masthead */
  --mast-fg:        #F2EAD3;   /* wordmark, primary text */
  --mast-fg-2:      #9AA8BD;   /* tagline, utility text */
  --mast-fg-dim:    #5E6A82;   /* placeholder text */

  /* ——— nav band ——— */
  --nav-bg:         #2D3526;   /* desaturated olive */
  --nav-bg-hover:   rgba(255,255,255,.05);
  --nav-bg-active:  rgba(201,134,63,.12);
  --nav-fg:         #D8D4C2;   /* default link */
  --nav-fg-active:  #F2EAD3;
  --nav-divider:    rgba(255,255,255,.06);

  /* ——— accent (used on rule + active underline) ——— */
  --accent-ochre:   #C9863F;
  --accent-ochre-2: #C9B98F;   /* warm cream highlight */

  /* ——— search input ——— */
  --input-bg:       #0E1320;
  --input-border:   #3A4663;
  --input-btn-bg:   #1A2235;
}
```

Notes:
- **Do not** retain the previous `--brand-orange` / `#F49A2C` value anywhere in the masthead or nav. It may remain in unrelated illustrations (e.g. map markers) for now.
- The olive `#2D3526` is intentionally desaturated. Bright greens will undo the effect.

---

## 3. Typography

| Element | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Wordmark | `"Source Serif 4", "Charter", Georgia, serif` | 600 | 38 px | letter‑spacing: ‑0.015em; line‑height: 1 |
| Wordmark final period | same | 500 | 38 px | color: `--accent-ochre`; font‑style: italic |
| Tagline | `"Source Serif 4", serif` | 400 | 13.5 px | font‑style: italic; color: `--mast-fg-2` |
| Nav links | `"Inter", system-ui, sans-serif` | 500 | 13 px | letter‑spacing: 0.005em |
| Nav link (active) | same | 600 | 13 px | |
| Search input | `"Inter", sans-serif` | 400 | 13.5 px | placeholder: italic, `--mast-fg-dim` |
| Search button | `"Inter", sans-serif` | 600 | 11 px | text‑transform: uppercase; letter‑spacing: 0.08em |

Do not use any other typefaces in this row. The serif/sans contrast between wordmark and nav is structural — the serif marks "the brand," the sans marks "the navigation."

---

## 4. Layout

### 4.1 Masthead row

```
┌────────────────────────────────────────────────────────────────────────┐
│  Topcastles.   │  ┊ tagline                              │  [search ]  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Container**: full‑bleed `--mast-bg`, padding `28px 32px 22px`.
- **Grid**: `grid-template-columns: auto 1fr auto; align-items: end; gap: 36px;`
- **Tagline divider**: 1 px left border on the tagline cell, `--mast-rule`, padded 14 px left, margin‑left 14 px. Aligns optically to the wordmark baseline.
- **Search input**: 380 px wide × 38 px tall, 1 px border `--input-border`, background `--input-bg`. Integrated SEARCH button as a left‑bordered cell, background `--input-btn-bg`.
- **Bottom border**: 1 px solid `--mast-rule`.

### 4.2 Nav row

```
┌────────────────────────────────────────────────────────────────────────┐
│ Home │ Top 1000 │ Top Countries │ Top Regions │ Atlas │ Background │ … │
└──────┴──────────┴───────────────┴─────────────┴───────┴───────────┴───┘
        ╲ ochre underline rule on the bottom edge ╱
```

- **Container**: full‑bleed `--nav-bg`, height 42 px.
- **Top edge**: 1 px solid `rgba(201,184,143,.15)`.
- **Bottom edge** (the *ochre rule*): a `::before` pseudo‑element, full width, 1 px tall, `linear-gradient(90deg, transparent, var(--accent-ochre) 30%, var(--accent-ochre) 70%, transparent)`. This is the single most identity‑bearing detail of the option — do not omit.
- **Inner**: padding `0 32px`; flex; align‑items: center; height 100%.
- **Links**: padding `0 16px`, full nav height. Each link separated by a 1 px right divider in `--nav-divider`. The first link gets a matching left divider.
- **Icon group** (Favorites, Nearest, theme toggle) sits right‑aligned (`margin-left: auto`) with no dividers, 12 px horizontal padding per icon, color `--mast-fg-2`.

### 4.3 Link states

| State | Background | Color | Other |
|---|---|---|---|
| Default | transparent | `--nav-fg` | — |
| Hover | `--nav-bg-hover` | `--mast-fg` | — |
| Active (current page) | `--nav-bg-active` | `--mast-fg` | `box-shadow: inset 0 -2px 0 var(--accent-ochre);` font‑weight 600 |
| Focus (keyboard) | `--nav-bg-hover` | `--mast-fg` | 2 px outline `--accent-ochre`, offset −2 px |

Important: the active state is *both* the faint ochre tint *and* the 2 px inset underline. Either alone is too quiet.

---

## 5. Reference HTML

This is the canonical structure. Class names are illustrative; map to the project's existing component names where appropriate.

```html
<header class="site-mast">
  <a class="mark" href="/">Topcastles<span class="dot">.</span></a>
  <p class="tag">An editorial atlas of medieval fortifications, ranked by editors and visitors.</p>
  <form class="search" role="search" action="/search">
    <input type="search" name="q" placeholder="Search 1,000 entries — name, country, region…" aria-label="Search the index">
    <button type="submit">Search</button>
  </form>
</header>

<nav class="site-nav" aria-label="Primary">
  <a href="/" aria-current="page">Home</a>
  <a href="/top1000">Top 1000</a>
  <a href="/countries">Top Countries</a>
  <a href="/regions">Top Regions</a>
  <a href="/atlas">Atlas</a>
  <a href="/background">Background</a>
  <a href="/developer">Developer · API</a>
  <div class="icons">
    <a href="/favorites" aria-label="Favorites">★</a>
    <a href="/nearest" aria-label="Nearest top castle">⌖</a>
    <a href="#" aria-label="Toggle theme">◐</a>
  </div>
</nav>
```

Active page detection: use `aria-current="page"` on the matching link and style with `[aria-current="page"]` instead of a separate `.active` class. This keeps semantics and styling aligned.

---

## 6. Reference CSS

```css
/* ——— masthead ——— */
.site-mast {
  background: var(--mast-bg);
  padding: 28px 32px 22px;
  border-bottom: 1px solid var(--mast-rule);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: end;
  gap: 36px;
}
.site-mast .mark {
  font-family: "Source Serif 4", serif;
  font-weight: 600;
  font-size: 38px;
  letter-spacing: -.015em;
  line-height: 1;
  color: var(--mast-fg);
  text-decoration: none;
}
.site-mast .mark .dot {
  color: var(--accent-ochre);
  font-style: italic;
  font-weight: 500;
}
.site-mast .tag {
  font-family: "Source Serif 4", serif;
  font-style: italic;
  color: var(--mast-fg-2);
  font-size: 13.5px;
  padding: 0 0 5px 14px;
  margin: 0 0 0 14px;
  border-left: 1px solid var(--mast-rule);
  align-self: end;
}
.site-mast .search {
  display: flex;
  height: 38px;
  width: 380px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
}
.site-mast .search input {
  flex: 1;
  background: transparent;
  border: 0;
  color: var(--mast-fg);
  padding: 0 12px;
  font: 400 13.5px/1 "Inter", sans-serif;
  outline: none;
}
.site-mast .search input::placeholder {
  color: var(--mast-fg-dim);
  font-style: italic;
}
.site-mast .search button {
  border: 0;
  border-left: 1px solid var(--input-border);
  background: var(--input-btn-bg);
  color: var(--mast-fg);
  font: 600 11px/1 "Inter", sans-serif;
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: 0 16px;
  cursor: pointer;
}

/* ——— nav band ——— */
.site-nav {
  position: relative;
  background: var(--nav-bg);
  border-top: 1px solid rgba(201,184,143,.15);
  border-bottom: 1px solid rgba(0,0,0,.25);
  padding: 0 32px;
  display: flex;
  align-items: center;
  height: 42px;
  font: 500 13px/1 "Inter", sans-serif;
}
.site-nav::before {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--accent-ochre) 30%,
    var(--accent-ochre) 70%,
    transparent);
}
.site-nav a {
  color: var(--nav-fg);
  text-decoration: none;
  padding: 0 16px;
  height: 100%;
  display: inline-flex;
  align-items: center;
  border-right: 1px solid var(--nav-divider);
  letter-spacing: .005em;
}
.site-nav a:first-child {
  border-left: 1px solid var(--nav-divider);
}
.site-nav a:hover {
  background: var(--nav-bg-hover);
  color: var(--mast-fg);
}
.site-nav a[aria-current="page"] {
  background: var(--nav-bg-active);
  color: var(--mast-fg);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--accent-ochre);
}
.site-nav a:focus-visible {
  outline: 2px solid var(--accent-ochre);
  outline-offset: -2px;
}
.site-nav .icons {
  margin-left: auto;
  display: flex;
  height: 100%;
  align-items: center;
}
.site-nav .icons a {
  padding: 0 12px;
  color: var(--mast-fg-2);
  border-right: 0;
}
.site-nav .icons a:hover { color: var(--mast-fg); }
```

---

## 7. Light mode

If the site supports a light theme, mirror the structure with these overrides:

```css
@media (prefers-color-scheme: light) {
  :root {
    --mast-bg:       #F8F4EA;
    --mast-rule:     #CFC3A4;
    --mast-fg:       #16130D;
    --mast-fg-2:     #6E6450;
    --mast-fg-dim:   #8E8467;
    --nav-bg:        #3A4030;        /* keep nav dark even in light mode */
    --nav-fg:        #D8D4C2;
    --nav-bg-hover:  rgba(255,255,255,.06);
    --nav-bg-active: rgba(201,134,63,.18);
    --input-bg:      #FFFCF3;
    --input-border:  #A89A77;
    --input-btn-bg:  #EDE4CC;
  }
}
```

The nav band stays dark in both themes — this is deliberate. A light olive band reads as institutional/medical; the dark olive is what carries the editorial register.

---

## 8. Responsive

- Below **960 px**: collapse the nav into a single hamburger button on the right of the masthead. The masthead grid becomes `auto 1fr auto` with the search collapsed to an icon trigger.
- The ochre rule under the nav band must persist in the collapsed state as a 1 px ochre line underneath the masthead.
- Tagline hides below **640 px**.

---

## 9. Accessibility checks

- Verify nav link contrast: `--nav-fg` (`#D8D4C2`) on `--nav-bg` (`#2D3526`) → ratio ≈ 9.4:1 ✓ AAA
- Verify active link contrast: `--mast-fg` (`#F2EAD3`) on the tinted `rgba(201,134,63,.12)` over olive → effective ≈ 10:1 ✓ AAA
- Tagline italic on the masthead: `--mast-fg-2` (`#9AA8BD`) on `--mast-bg` (`#0B101C`) → ratio ≈ 7.0:1 ✓ AAA
- All nav items must be keyboard‑reachable in DOM order and have visible focus ring (defined above).
- The decorative crest period (`.mark .dot`) carries no semantic meaning; do not announce it to screen readers (the `<span>` inherits naturally).

---

## 10. Definition of done

- [ ] Old orange `#F49A2C` band is removed from masthead/nav (other appearances may remain pending review).
- [ ] New `:root` tokens added; no hard‑coded hexes in masthead/nav components.
- [ ] Wordmark renders in Source Serif 4 600 with italic ochre period.
- [ ] Nav band is olive, with the gradient ochre rule visible at the bottom edge.
- [ ] Active page link has both the tint *and* the 2 px inset ochre underline.
- [ ] Hover, focus, and active states render distinctly.
- [ ] Search input renders without a fill button background; SEARCH cell uses `--input-btn-bg`.
- [ ] Below 960 px, nav collapses to hamburger; masthead remains usable.
- [ ] No regression in non‑nav surfaces (homepage cards, ranking tables, sidebar).

---

## 11. Out of scope

This change is *only* the masthead + nav. The following are explicitly **not** part of this round and should not be modified:

- Homepage hero / "From today's index" block
- Top 10 dual‑ranking table
- Distribution map and atlas annotations
- Sidebar boxes (About, Castle of the Week, Discover the List)
- Footer
- Page‑specific styling (Top 1000 grid, Country/Region tile pages, Background, Developer)

A separate spec will follow for each.
