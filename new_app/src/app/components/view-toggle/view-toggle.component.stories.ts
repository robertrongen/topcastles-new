import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ViewToggleComponent } from './view-toggle.component';

const meta: Meta<ViewToggleComponent> = {
  title: 'Components/ViewToggle',
  component: ViewToggleComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations()] }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ViewToggleComponent>;

export const Default: Story = {
  args: { hideMap: false },
};

export const NoMapOption: Story = {
  args: { hideMap: true },
};
