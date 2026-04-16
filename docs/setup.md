# Setup

## Target stack (ADR-002)

| Concern | Choice | Version | Why |
|---|---|---|---|
| Framework | **Angular** | 19.2+ | Company standard; Standalone Components + Signals are the modern Angular patterns |
| UI library | **Angular Material** | 19.2+ | Pre-built accessible components (tables, cards, nav) with theming support |
| Component docs | **Storybook** | 9.1+ | Develop and review components in isolation before wiring data |
| Language | **TypeScript** | 5.7+ | Required by Angular; provides compile-time safety across the codebase |
| Styling | **SCSS** | — | CSS Custom Properties for theming; Angular Material uses SCSS natively |
| Linting | **ESLint** | — | With `@angular-eslint` for Angular-specific rules |
| Formatting | **Prettier** | — | Consistent code style; integrates with ESLint via `eslint-config-prettier` |
| Unit testing | **Karma + Jasmine** | — | Angular CLI default; may evaluate Vitest later |
| E2E testing | **Playwright** | — | Cross-browser E2E tests for migration parity validation |
| Package manager | **npm** | — | Angular CLI default; keeps setup simple |
| Data layer | **Static JSON** | — | CSV → JSON conversion at build time (ADR-003); no DB anywhere |
| Rendering | **Angular SSR** | — | `@angular/ssr` for server-side rendering + prerendering for SEO |
| Containerization | **Docker** | — | Multi-stage build; Node Alpine runtime for Synology NAS (ADR-004) |

## Key Angular concepts to learn

This section explains the Angular patterns you'll encounter during the migration. Each concept
maps to a concrete part of the castle site.

### Standalone Components

Angular 19 defaults to **standalone components** — each component declares its own imports
instead of belonging to an `NgModule`. This keeps the dependency graph explicit and tree-shakeable.

```typescript
// Example: a castle-card component
@Component({
  selector: 'app-castle-card',
  standalone: true,
  imports: [MatCardModule, CommonModule],  // declare what THIS component needs
  templateUrl: './castle-card.component.html',
  styleUrl: './castle-card.component.scss'
})
export class CastleCardComponent {
  @Input() castle!: Castle;
}
```

**Migration mapping**: Each PHP include (e.g., `ct_kastelen_main.php`) becomes a standalone component.

### Signals

Signals are Angular's reactive primitive (replacing much of RxJS for simple state).
A signal holds a value and notifies the template when it changes.

```typescript
// In a service
castles = signal<Castle[]>([]);

// In a component — the template auto-updates when the signal changes
readonly castleCount = computed(() => this.castleService.castles().length);
```

**Migration mapping**: Castle data loaded from JSON → stored in a signal → template reacts automatically.

### Angular Material

Material provides ready-made components that match common UI patterns in the castle site:

| PHP page pattern | Angular Material component |
|---|---|
| Castle listing tables | `mat-table` with sorting (`matSort`) |
| Navigation menu | `mat-toolbar` + `mat-sidenav` |
| Castle detail cards | `mat-card` |
| Search form | `mat-form-field` + `mat-input` |
| Pagination | `mat-paginator` |

### Services and Dependency Injection

Angular uses **services** to share data and logic across components. The `inject()` function
(preferred over constructor injection in modern Angular) provides dependencies:

```typescript
@Injectable({ providedIn: 'root' })
export class CastleService {
  private http = inject(HttpClient);
  
  castles = signal<Castle[]>([]);
  
  loadCastles() {
    this.http.get<Castle[]>('/assets/data/castles.json')
      .subscribe(data => this.castles.set(data));
  }
}
```

**Migration mapping**: `old_app/functions/perform_query.php` → `CastleService` that loads JSON.

### Routing

Angular Router maps URLs to components. Routes preserve the old PHP URL patterns:

```typescript
// Example route configuration
export const routes: Routes = [
  { path: '', component: HomeComponent },           // index.php
  { path: 'castles', component: CastlesComponent }, // kastelen.php
  { path: 'castle/:id', component: CastleDetailComponent },
  { path: 'top100', component: Top100Component },   // top100.php
  { path: 'search', component: SearchComponent },   // zoeken.php
];
```

### Storybook

Storybook lets you build and test components without running the full app.
Each component gets a `.stories.ts` file:

```typescript
// castle-card.stories.ts
export default { component: CastleCardComponent };

export const Default: Story = {
  args: {
    castle: { name: 'Château de Chambord', country: 'France', score: 95 }
  }
};
```

**Workflow**: Build the component in Storybook first → verify it looks right → wire it into the app.

## Known constraints

- Source application: PHP with MySQL (`old_app/`)
- Migration scope: EN-only, read-only public pages (ADR-001)
- Data: Static JSON converted from CSV (ADR-003) — source: `old_app/database/Topcastles export.csv` (1000 castles, 41 columns)
- Deployment: Docker container on Synology NAS (ADR-004)

## Project structure (planned)

```
new_app/
├── src/
│   ├── app/
│   │   ├── components/          # Shared/reusable components
│   │   ├── pages/               # Route-level page components
│   │   ├── services/            # Data loading, shared logic
│   │   ├── models/              # TypeScript interfaces (Castle, Country, etc.)
│   │   ├── app.component.ts     # Root component (layout shell)
│   │   ├── app.config.ts        # App-level providers (SSR, router, Material)
│   │   └── app.routes.ts        # Route definitions
│   ├── assets/
│   │   └── data/                # Static JSON files (castle data)
│   ├── styles/
│   │   └── _theme.scss          # Angular Material custom theme
│   └── index.html
├── .storybook/                  # Storybook configuration
├── angular.json                 # Angular CLI workspace config
├── Dockerfile                   # Multi-stage Docker build
├── .dockerignore                # Exclude node_modules, old_app, etc.
├── tsconfig.json
└── package.json
```

## Local development commands (after skeleton creation)

```bash
npm install                  # Install dependencies
ng serve                     # Dev server at http://localhost:4200
ng build                     # Production build
ng test                      # Unit tests (Karma)
npx playwright test          # E2E tests
npm run storybook            # Storybook at http://localhost:6006
```
