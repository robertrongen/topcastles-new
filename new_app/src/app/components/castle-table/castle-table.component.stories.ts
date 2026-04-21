import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { CastleTableComponent } from './castle-table.component';
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

const ALL_COLUMNS = ['position', 'score_total', 'score_visitors', 'thumbnail', 'castle_name', 'era', 'country', 'place', 'region', 'castle_type', 'condition'];
const COMPACT_COLUMNS = ['position', 'score_total', 'thumbnail', 'castle_name', 'country', 'place'];

const meta: Meta<CastleTableComponent> = {
  title: 'Components/CastleTable',
  component: CastleTableComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations(), provideRouter([])] }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Virtual-scroll table using CDK `*cdkVirtualFor`. The header row sits above the `cdk-virtual-scroll-viewport` so it never scrolls away. `BreakpointObserver` drives responsive column hiding — resize the Storybook viewport to see columns appear/disappear.',
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

export const LargeList: Story = {
  name: 'Large list (1 000 items — virtual scroll)',
  args: {
    castles: generateCastles(1000),
    columns: ALL_COLUMNS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Only the ~6 visible rows are in the DOM at any time. Scroll the inner viewport to confirm rows are created on demand. Open DevTools → Elements and observe the `.body-row` count stays constant while scrolling.',
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

export const Tablet: Story = {
  name: 'Tablet viewport (≤1199px — era/visitors/condition hidden)',
  args: {
    castles: generateCastles(50),
    columns: ALL_COLUMNS,
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    docs: {
      description: {
        story: '`BreakpointObserver` removes score_visitors, era and condition from the grid template. The column widths recalculate automatically — no CSS `display:none` needed.',
      },
    },
  },
};

export const Mobile: Story = {
  name: 'Mobile viewport (≤767px — place/region/type hidden, thumb shrinks)',
  args: {
    castles: generateCastles(50),
    columns: ALL_COLUMNS,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
