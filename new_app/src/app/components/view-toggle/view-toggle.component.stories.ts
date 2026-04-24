import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ViewToggleComponent } from './view-toggle.component';
import { ViewMode, ViewModeService } from '../../services/view-mode.service';

function viewModeProvider(initialMode: ViewMode) {
  const mode = signal<ViewMode>(initialMode);
  return {
    provide: ViewModeService,
    useValue: {
      mode: mode.asReadonly(),
      setMode: (next: ViewMode) => mode.set(next),
    },
  };
}

const meta: Meta<ViewToggleComponent> = {
  title: 'Components/ViewToggle',
  component: ViewToggleComponent,
  decorators: [
    applicationConfig({ providers: [provideAnimations(), viewModeProvider('grid')] }),
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

export const ListSelected: Story = {
  args: { hideMap: false },
  decorators: [
    applicationConfig({ providers: [viewModeProvider('list')] }),
  ],
};

export const MapSelected: Story = {
  args: { hideMap: false },
  decorators: [
    applicationConfig({ providers: [viewModeProvider('map')] }),
  ],
};

export const DarkTheme: Story = {
  args: { hideMap: false },
  render: args => ({
    props: args,
    template: `
      <div data-theme="dark" style="min-height: 128px; padding: 24px; background: var(--tk-body-bg); color: var(--tk-text);">
        <div style="display: flex; justify-content: flex-end; padding: 16px; background: var(--tk-surface-alt); border: 1px solid var(--tk-divider); border-radius: var(--tk-radius-md);">
          <app-view-toggle [hideMap]="hideMap"></app-view-toggle>
        </div>
      </div>
    `,
  }),
};

export const DarkThemeNoMap: Story = {
  args: { hideMap: true },
  render: args => ({
    props: args,
    template: `
      <div data-theme="dark" style="min-height: 128px; padding: 24px; background: var(--tk-body-bg); color: var(--tk-text);">
        <app-view-toggle [hideMap]="hideMap"></app-view-toggle>
      </div>
    `,
  }),
};
