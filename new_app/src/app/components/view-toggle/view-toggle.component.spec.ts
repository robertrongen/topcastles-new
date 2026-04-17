import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Signal, signal, WritableSignal } from '@angular/core';
import { ViewToggleComponent } from './view-toggle.component';
import { ViewModeService, ViewMode } from '../../services/view-mode.service';

describe('ViewToggleComponent', () => {
  let fixture: ComponentFixture<ViewToggleComponent>;
  let modeSignal: WritableSignal<ViewMode>;
  let mockService: { mode: Signal<ViewMode>; setMode: jasmine.Spy };

  beforeEach(async () => {
    modeSignal = signal<ViewMode>('list');
    mockService = {
      mode: modeSignal.asReadonly(),
      setMode: jasmine.createSpy('setMode').and.callFake((m: ViewMode) => modeSignal.set(m)),
    };

    await TestBed.configureTestingModule({
      imports: [ViewToggleComponent, NoopAnimationsModule],
      providers: [{ provide: ViewModeService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewToggleComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render two mat-button-toggle elements', () => {
    const toggles = fixture.nativeElement.querySelectorAll('mat-button-toggle');
    expect(toggles.length).toBe(2);
  });

  it('should have list and grid toggle values', () => {
    const toggles = fixture.nativeElement.querySelectorAll('mat-button-toggle');
    expect(toggles[0].getAttribute('value')).toBe('list');
    expect(toggles[1].getAttribute('value')).toBe('grid');
  });

  it('setView should call viewModeService.setMode with grid', () => {
    fixture.componentInstance.setView('grid');
    expect(mockService.setMode).toHaveBeenCalledWith('grid');
  });

  it('setView should call viewModeService.setMode with list', () => {
    fixture.componentInstance.setView('list');
    expect(mockService.setMode).toHaveBeenCalledWith('list');
  });

  it('should update toggle selection when mode changes to grid', () => {
    fixture.componentInstance.setView('grid');
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('mat-button-toggle-group');
    expect(group.getAttribute('ng-reflect-value')).toBe('grid');
  });
});
