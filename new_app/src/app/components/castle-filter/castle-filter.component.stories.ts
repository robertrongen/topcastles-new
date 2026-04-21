import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CastleFilterComponent } from './castle-filter.component';
import { Castle } from '../../models/castle.model';

const SAMPLE_CASTLES: Partial<Castle>[] = [
  { castle_code: 'alnwick', castle_name: 'Alnwick Castle', country: 'England', castle_type: 'Castle', condition: 'intact', era: 12 },
  { castle_code: 'dover', castle_name: 'Dover Castle', country: 'England', castle_type: 'Castle', condition: 'intact', era: 12 },
  { castle_code: 'heidelberg', castle_name: 'Heidelberg Castle', country: 'Germany', castle_type: 'Palace', condition: 'ruin', era: 14 },
  { castle_code: 'neuschwanstein', castle_name: 'Neuschwanstein', country: 'Germany', castle_type: 'Palace', condition: 'intact', era: 19 },
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
    castles: SAMPLE_CASTLES as Castle[],
    fields: [
      { key: 'country', label: 'Country' },
      { key: 'castle_type', label: 'Type' },
      { key: 'condition', label: 'Condition' },
    ],
    initialFilters: {},
  },
};

export const PreFiltered: Story = {
  args: {
    ...Default.args,
    initialFilters: { country: 'England' },
  },
};
