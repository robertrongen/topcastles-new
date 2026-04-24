import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { CastleTableComponent } from './castle-table.component';
import { FavoritesService } from '../../services/favorites.service';
import { favoriteCastleSet, generateCastles, minimalCastle } from '../../testing/castle-mock';

const ALL_COLUMNS = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];
const COMPACT_COLUMNS = ['position', 'score_total', 'thumbnail', 'castle_name', 'country', 'place'];

const favoriteServiceMock = {
  favorites: signal([favoriteCastleSet]),
};

const meta: Meta<CastleTableComponent> = {
  title: 'Components/CastleTable',
  component: CastleTableComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideRouter([]),
        { provide: FavoritesService, useValue: favoriteServiceMock },
      ],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Virtual-scroll table using CDK *cdkVirtualFor. BreakpointObserver drives responsive column hiding; resize the Storybook viewport to see columns appear or disappear.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<CastleTableComponent>;

export const Default: Story = {
  args: {
    castles: generateCastles(10),
    columns: ALL_COLUMNS,
  },
};

export const MinimalContent: Story = {
  name: 'Minimal content',
  args: {
    castles: [minimalCastle],
    columns: ALL_COLUMNS,
  },
};

export const Empty: Story = {
  args: {
    castles: [],
    columns: ALL_COLUMNS,
  },
};

export const LargeList: Story = {
  name: 'Large list (1 000 items - virtual scroll)',
  args: {
    castles: generateCastles(1000),
    columns: ALL_COLUMNS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Only visible rows are in the DOM at one time. Scroll the inner viewport to confirm rows are created on demand.',
      },
    },
  },
};

export const CompactColumns: Story = {
  name: 'Compact column set',
  args: {
    castles: generateCastles(100),
    columns: COMPACT_COLUMNS,
  },
};

export const RemovableFavorites: Story = {
  name: 'Removable favorite set',
  args: {
    castles: generateCastles(20),
    columns: COMPACT_COLUMNS,
    removable: true,
  },
};

export const Tablet: Story = {
  name: 'Tablet viewport (<=1199px - era/visitors/condition hidden)',
  args: {
    castles: generateCastles(50),
    columns: ALL_COLUMNS,
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    docs: {
      description: {
        story: 'BreakpointObserver removes score_visitors, era and condition from the grid template.',
      },
    },
  },
};

export const Mobile: Story = {
  name: 'Mobile viewport (<=767px - place/region/type hidden, thumb shrinks)',
  args: {
    castles: generateCastles(50),
    columns: ALL_COLUMNS,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const DarkTheme: Story = {
  args: {
    castles: generateCastles(12),
    columns: ALL_COLUMNS,
  },
  render: args => ({
    props: args,
    template: `
      <div data-theme="dark" style="min-height: 100vh; padding: 16px; background: var(--tk-body-bg); color: var(--tk-text);">
        <app-castle-table [castles]="castles" [columns]="columns"></app-castle-table>
      </div>
    `,
  }),
};
