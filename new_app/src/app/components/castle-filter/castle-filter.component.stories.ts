import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CastleFilterComponent } from './castle-filter.component';
import { generateCastles, minimalCastle } from '../../testing/castle-mock';

const SAMPLE_CASTLES = [
  { ...generateCastles(1)[0], castle_code: 'alnwick', castle_name: 'Alnwick Castle', country: 'England', castle_type: 'Castle', condition: 'Intact', era: 12 },
  { ...generateCastles(1)[0], castle_code: 'dover', castle_name: 'Dover Castle', country: 'England', castle_type: 'Castle', condition: 'Intact', era: 12 },
  { ...generateCastles(1)[0], castle_code: 'heidelberg', castle_name: 'Heidelberg Castle', country: 'Germany', castle_type: 'Palace', condition: 'Ruin', era: 14 },
  { ...generateCastles(1)[0], castle_code: 'neuschwanstein', castle_name: 'Neuschwanstein', country: 'Germany', castle_type: 'Palace', condition: 'Intact', era: 19 },
];

const FILTER_FIELDS = [
  { key: 'country', label: 'Country' },
  { key: 'castle_type', label: 'Type' },
  { key: 'condition', label: 'Condition' },
];

const meta: Meta<CastleFilterComponent> = {
  title: 'Components/CastleFilter',
  component: CastleFilterComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CastleFilterComponent>;

export const Default: Story = {
  args: {
    castles: SAMPLE_CASTLES,
    fields: FILTER_FIELDS,
    initialFilters: {},
  },
};

export const PreFiltered: Story = {
  args: {
    ...Default.args,
    initialFilters: { country: 'England' },
  },
};

export const MinimalOptions: Story = {
  name: 'Minimal options',
  args: {
    castles: [minimalCastle],
    fields: [
      { key: 'country', label: 'Country' },
      { key: 'condition', label: 'Condition' },
    ],
    initialFilters: {},
  },
};

export const NoFields: Story = {
  args: {
    castles: SAMPLE_CASTLES,
    fields: [],
    initialFilters: {},
  },
};

export const EmptyData: Story = {
  args: {
    castles: [],
    fields: FILTER_FIELDS,
    initialFilters: {},
  },
};

export const Mobile: Story = {
  args: Default.args,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const DarkTheme: Story = {
  args: {
    ...Default.args,
    initialFilters: { country: 'England' },
  },
  render: args => ({
    props: args,
    template: `
      <div data-theme="dark" style="min-height: 240px; padding: 24px; background: var(--tk-body-bg); color: var(--tk-text);">
        <div style="padding: 16px; background: var(--tk-surface-alt); border: 1px solid var(--tk-divider); border-radius: var(--tk-radius-md);">
          <app-castle-filter [castles]="castles" [fields]="fields" [initialFilters]="initialFilters"></app-castle-filter>
        </div>
      </div>
    `,
  }),
};
