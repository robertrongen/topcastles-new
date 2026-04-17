import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ViewModeService } from './view-mode.service';

describe('ViewModeService', () => {
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;

  function createService(stored: string | null = null): ViewModeService {
    getItemSpy = spyOn(localStorage, 'getItem').and.returnValue(stored);
    setItemSpy = spyOn(localStorage, 'setItem');
    TestBed.configureTestingModule({
      providers: [
        ViewModeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    return TestBed.inject(ViewModeService);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should default to list when nothing is stored', () => {
    const service = createService(null);
    expect(service.mode()).toBe('list');
  });

  it('should read grid mode from localStorage on init', () => {
    const service = createService('grid');
    expect(service.mode()).toBe('grid');
  });

  it('should read list mode from localStorage on init', () => {
    const service = createService('list');
    expect(service.mode()).toBe('list');
  });

  it('should ignore invalid localStorage values and default to list', () => {
    const service = createService('invalid');
    expect(service.mode()).toBe('list');
  });

  it('setMode should update signal and write to localStorage', () => {
    const service = createService(null);
    service.setMode('grid');
    expect(service.mode()).toBe('grid');
    expect(setItemSpy).toHaveBeenCalledWith('castle-view-mode', 'grid');
  });

  it('setMode should switch back to list', () => {
    const service = createService('grid');
    service.setMode('list');
    expect(service.mode()).toBe('list');
    expect(setItemSpy).toHaveBeenCalledWith('castle-view-mode', 'list');
  });
});
