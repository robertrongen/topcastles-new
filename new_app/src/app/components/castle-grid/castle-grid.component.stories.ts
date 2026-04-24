import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CastleGridComponent } from './castle-grid.component';
import { FavoritesService } from '../../services/favorites.service';
import { favoriteCastleSet, generateCastles, minimalCastle } from '../../testing/castle-mock';

const favoriteServiceMock = {
  favorites: signal([favoriteCastleSet]),
};

const meta: Meta<CastleGridComponent> = {
  title: 'Components/CastleGrid',
  component: CastleGridComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favoriteServiceMock },
      ],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CastleGridComponent>;

export const Default: Story = {
  args: { castles: generateCastles(12) },
};

export const MinimalContent: Story = {
  name: 'Minimal content',
  args: { castles: [minimalCastle] },
};

export const Empty: Story = {
  args: { castles: [] },
};

export const RemovableFavorites: Story = {
  name: 'Removable favorite set',
  args: {
    castles: generateCastles(6),
    removable: true,
  },
};

export const LargeList: Story = {
  name: 'Large list (1 000 items - lazy images, no virtual scroll)',
  args: { castles: generateCastles(1000) },
  parameters: {
    docs: {
      description: {
        story: 'All 1 000 castles render at once. Images use loading="lazy" so the browser defers off-screen requests, but all card DOM is still created immediately.',
      },
    },
  },
};

export const Filtered: Story = {
  name: 'Filtered (20 items)',
  args: { castles: generateCastles(20) },
};

export const Mobile: Story = {
  args: { castles: generateCastles(8) },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const DarkTheme: Story = {
  args: { castles: generateCastles(8) },
  render: args => ({
    props: args,
    template: `
      <div data-theme="dark" style="min-height: 100vh; padding: 16px; background: var(--tk-body-bg); color: var(--tk-text);">
        <app-castle-grid [castles]="castles"></app-castle-grid>
      </div>
    `,
  }),
};
