import { TestBed } from '@angular/core/testing';
import { ViewModeService } from './view-mode.service';

describe('ViewModeService', () => {
  function createService(): ViewModeService {
    TestBed.configureTestingModule({ providers: [ViewModeService] });
    return TestBed.inject(ViewModeService);
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should default to grid', () => {
    expect(createService().mode()).toBe('grid');
  });

  it('setMode should update the signal to list', () => {
    const service = createService();
    service.setMode('list');
    expect(service.mode()).toBe('list');
  });

  it('setMode should update the signal to grid', () => {
    const service = createService();
    service.setMode('list');
    service.setMode('grid');
    expect(service.mode()).toBe('grid');
  });
});
