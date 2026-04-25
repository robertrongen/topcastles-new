import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { CastleMapComponent } from './castle-map.component';
import { generateCastles } from '../../testing/castle-mock';

const meta: Meta<CastleMapComponent> = {
  title: 'Components/CastleMap',
  component: CastleMapComponent,
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CastleMapComponent>;

export const Default: Story = {
  args: {
    castles: generateCastles(12),
  },
  render: args => ({
    props: args,
    template: `
      <div style="height: 480px;">
        <app-castle-map [castles]="castles"></app-castle-map>
      </div>
    `,
  }),
};

export const DarkTheme: Story = {
  args: {
    castles: generateCastles(12),
  },
  render: args => ({
    props: args,
    template: `
      <div data-theme="dark" style="min-height: 560px; padding: 24px; background: var(--tk-body-bg); color: var(--tk-text);">
        <div style="height: 480px; padding: 8px; background: var(--tk-surface-alt); border: 1px solid var(--tk-divider); border-radius: var(--tk-radius-md);">
          <app-castle-map [castles]="castles"></app-castle-map>
        </div>
      </div>
    `,
  }),
};

export const CompactPanel: Story = {
  args: {
    castles: generateCastles(12),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: args => ({
    props: args,
    template: `
      <div style="height: 420px; padding: 8px; background: var(--tk-surface-alt); border: 1px solid var(--tk-divider); border-radius: var(--tk-radius-md);">
        <app-castle-map style="--tk-map-min-height: 0;" [castles]="castles"></app-castle-map>
      </div>
    `,
  }),
};
