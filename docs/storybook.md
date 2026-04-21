# Storybook in Topcastles

## Running Storybook

```bash
cd new_app
npm run storybook        # dev server at http://localhost:6006
npm run build-storybook  # static build to storybook-static/
```

## Story files

Stories live alongside their component:

```
src/app/components/
  castle-filter/castle-filter.component.stories.ts
  castle-grid/castle-grid.component.stories.ts
  castle-table/castle-table.component.stories.ts
  view-toggle/view-toggle.component.stories.ts
```

## Writing a story

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MyComponent } from './my.component';

const meta: Meta<MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),   // needed for Angular Material
        provideRouter([]),     // needed for RouterLink
      ],
    }),
  ],
  tags: ['autodocs'],         // auto-generates API docs from inputs
};

export default meta;
type Story = StoryObj<MyComponent>;

export const Default: Story = {
  args: { myInput: 'value' },
};
```

### Required providers

| Situation | Provider |
|-----------|----------|
| Angular Material components | `provideAnimations()` |
| `RouterLink` in template | `provideRouter([])` |
| HTTP calls | `provideHttpClient()` |
| Component injects a service | provide a mock or the real service |

## Testing responsive behaviour

Use the **Viewport** toolbar in Storybook to switch between breakpoints, or hardcode one in the story:

```typescript
export const Mobile: Story = {
  args: { ... },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },   // 320×568
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },    // 834×1112
  },
};
```

Available preset names: `mobile1`, `mobile2`, `tablet`, `desktop` (1280px).  
Custom sizes can be added in `.storybook/preview.ts`.

## What Storybook is good for in this project

| Use case | How |
|----------|-----|
| **Virtual scroll** — verify only visible DOM nodes are created | Open DevTools → Elements while scrolling the `LargeList` story |
| **Responsive column hiding** — `BreakpointObserver` in `CastleTableComponent` | Switch viewport; columns appear/disappear without a page reload |
| **Image fallback chain** — local → Wikipedia → icon | Set `failedLocal` signal in story args or trigger via `onLocalError` |
| **Filter interaction** — `CastleFilterComponent` | Use the `PreFiltered` story or change args via Controls panel |
| **Accessibility** — ARIA roles, keyboard nav | Run the `a11y` addon (install `@storybook/addon-a11y`) |

## Castle mock data helper

Both `castle-grid` and `castle-table` stories use the same local `generateCastles(n)` helper.
If you need shared fixtures across multiple story files, extract to `src/app/testing/castle-mock.ts`.

## Adding the a11y addon (recommended)

```bash
npm install --save-dev @storybook/addon-a11y
```

In `.storybook/main.ts`, add `'@storybook/addon-a11y'` to the `addons` array.  
Every story then gets an **Accessibility** tab that runs axe-core checks.

## Configured addons

| Addon | Purpose |
|-------|---------|
| `@storybook/addon-docs` | Auto-docs from JSDoc + `tags: ['autodocs']` |
| `@storybook/addon-onboarding` | Interactive tour (can be removed) |
