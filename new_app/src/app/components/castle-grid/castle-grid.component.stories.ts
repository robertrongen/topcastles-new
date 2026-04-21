import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { CastleGridComponent } from './castle-grid.component';
import { Castle } from '../../models/castle.model';

const COUNTRIES = ['England', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Austria', 'Poland'];
const TYPES = ['Mountain castle', 'Water castle', 'City castle', 'Rock castle'];
const CONDITIONS = ['Intact', 'Rebuild/Restored', 'Damaged', 'Ruined/Partly remained'];

function generateCastles(count: number): Castle[] {
  return Array.from({ length: count }, (_, i) => ({
    position: i + 1,
    castle_code: `castle_${i}`,
    castle_name: `Castle ${i + 1}`,
    country: COUNTRIES[i % COUNTRIES.length],
    area: COUNTRIES[i % COUNTRIES.length],
    place: `Town ${i + 1}`,
    region: `Region ${Math.floor(i / 8) + 1}`,
    region_code: `region_${Math.floor(i / 8)}`,
    latitude: 48 + (i % 10),
    longitude: 5 + (i % 20),
    score_total: Math.max(1, 1000 - i),
    score_visitors: (i % 5) + 1,
    castle_type: TYPES[i % TYPES.length],
    castle_concept: '',
    condition: CONDITIONS[i % CONDITIONS.length],
    era: 10 + (i % 8),
    founder: '',
    remarkable: '',
    description: '',
    website: '',
    visitors: (1000 - i) * 1000,
  }));
}

const meta: Meta<CastleGridComponent> = {
  title: 'Components/CastleGrid',
  component: CastleGridComponent,
  decorators: [
    applicationConfig({ providers: [provideRouter([])] }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CastleGridComponent>;

export const Default: Story = {
  args: { castles: generateCastles(12) },
};

export const LargeList: Story = {
  name: 'Large list (1 000 items — lazy images, no virtual scroll)',
  args: { castles: generateCastles(1000) },
  parameters: {
    docs: {
      description: {
        story: 'All 1 000 castles rendered at once. Images use `loading="lazy"` so the browser defers off-screen requests, but all ~15 000 DOM nodes are created immediately. Compare initial render time vs the virtual-scroll table.',
      },
    },
  },
};

export const Filtered: Story = {
  name: 'Filtered (20 items)',
  args: { castles: generateCastles(20) },
};
