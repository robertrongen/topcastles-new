# Setup

## Stack (ADR-002)

| Concern          | Choice           | Version | Notes                                                         |
| ---------------- | ---------------- | ------- | ------------------------------------------------------------- |
| Framework        | Angular          | 19.2+   | Standalone Components + Signals                               |
| UI library       | Angular Material | 19.2+   | Tables, cards, nav, theming                                   |
| Component docs   | Storybook        | 9.1+    | Isolated component development and review                     |
| Language         | TypeScript       | 5.7+    | Required by Angular                                           |
| Styling          | SCSS             | -       | CSS Custom Properties; Angular Material uses SCSS natively    |
| Linting          | ESLint           | -       | With `@angular-eslint`                                        |
| Formatting       | Prettier         | -       | Integrated with ESLint via `eslint-config-prettier`           |
| Unit testing     | Karma + Jasmine  | -       | Angular CLI default                                           |
| Package manager  | npm              | -       | Angular CLI default                                           |
| Data layer       | Static JSON      | -       | CSV to JSON conversion at build time (ADR-003); no database   |
| Rendering        | Angular SSR      | -       | `@angular/ssr` for SSR and prerendering (SEO)                 |
| Containerization | Docker           | -       | Multi-stage build; Node Alpine runtime for Synology (ADR-004) |

## Project structure

```text
new_app/
├── src/
│   ├── app/
│   │   ├── components/          # Shared/reusable components
│   │   │   ├── castle-filter/
│   │   │   ├── castle-grid/
│   │   │   ├── castle-table/
│   │   │   └── view-toggle/
│   │   ├── pages/               # Route-level page components
│   │   │   ├── background/
│   │   │   ├── castle-detail/
│   │   │   ├── castles/
│   │   │   ├── country-detail/
│   │   │   ├── home/
│   │   │   ├── nocastle-detail/
│   │   │   ├── top-countries/
│   │   │   ├── top-regions/
│   │   │   └── top100/
│   │   ├── services/            # Data loading, shared logic
│   │   ├── models/              # TypeScript interfaces
│   │   ├── app.component.ts     # Root component (layout shell)
│   │   ├── app.config.ts        # App-level providers
│   │   └── app.routes.ts        # Route definitions
│   ├── assets/
│   │   └── data/                # Static JSON files (castle data)
│   └── index.html
├── .storybook/                  # Storybook configuration
├── angular.json
├── Dockerfile
└── package.json
```

## Known constraints

- Data: static JSON converted from CSV (ADR-003) — source: `old_app/database/Topcastles export.csv` (1000 castles, 41 columns)
- Deployment: Docker container on Synology NAS (ADR-004)
- English-only content (ADR-001)
