import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { AdminPipelineComponent, PipelineJob, PipelineStatus } from './admin-pipeline.component';
import { AdminAuthService } from '../admin-auth.service';

describe('AdminPipelineComponent', () => {
  let fixture: ComponentFixture<AdminPipelineComponent>;
  let component: AdminPipelineComponent;
  let httpTesting: HttpTestingController;
  let auth: jasmine.SpyObj<AdminAuthService>;

  const statusFixture: PipelineStatus = {
    pendingUpload: null,
    buildNotice: null,
    warnings: ['No pending upload is staged.'],
    ledger: {
      lastStagedAt: null,
      lastStagedHash: null,
      lastBuildAt: null,
      lastDeployAt: null,
      notes: [],
    },
  };

  const runningJob: PipelineJob = {
    id: 'job-running',
    type: 'rebuild',
    status: 'running',
    requestedBy: 'Robert',
    reason: 'staged enriched dataset ready',
    createdAt: '2026-05-05T11:00:00.000Z',
    startedAt: '2026-05-05T11:00:00.000Z',
    completedAt: null,
    logFile: 'pipeline/logs/job-running.log',
    errorMessage: null,
  };

  const completedJob: PipelineJob = {
    ...runningJob,
    id: 'job-completed',
    status: 'completed',
    completedAt: '2026-05-05T11:05:00.000Z',
    logFile: 'pipeline/logs/job-completed.log',
  };

  beforeEach(async () => {
    auth = jasmine.createSpyObj('AdminAuthService', ['getAuthHeaders', 'handle']);
    auth.getAuthHeaders.and.returnValue({ Authorization: 'Bearer admin-token' });
    auth.handle.and.returnValue('Robert');

    await TestBed.configureTestingModule({
      imports: [AdminPipelineComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminAuthService, useValue: auth },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdminPipelineComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
    httpTesting.verify();
    TestBed.resetTestingModule();
  });

  function startAndFlushInitial(options: {
    rebuild?: Record<string, unknown>;
    enrichment?: Record<string, unknown>;
    jobs?: PipelineJob[];
    jobsError?: boolean;
  } = {}) {
    fixture.detectChanges();

    httpTesting.expectOne('/api/admin/pipeline/status').flush(statusFixture);

    const rebuildReq = httpTesting.expectOne('/api/admin/pipeline/rebuild-request');
    if (options.rebuild) {
      rebuildReq.flush(options.rebuild);
    } else {
      rebuildReq.flush({ error: 'no rebuild request' }, { status: 404, statusText: 'Not Found' });
    }

    const enrichmentReq = httpTesting.expectOne('/api/admin/pipeline/enrichment-request');
    if (options.enrichment) {
      enrichmentReq.flush(options.enrichment);
    } else {
      enrichmentReq.flush({ error: 'no enrichment request' }, { status: 404, statusText: 'Not Found' });
    }

    tick();

    const jobsReq = httpTesting.expectOne('/api/admin/pipeline/jobs');
    if (options.jobsError) {
      jobsReq.flush({ error: 'jobs unavailable' }, { status: 500, statusText: 'Server Error' });
    } else {
      jobsReq.flush(options.jobs ?? []);
    }
    tick();
    fixture.detectChanges();
  }

  it('loads status and renders the no-request handoff state', fakeAsync(() => {
    startAndFlushInitial();

    const text = fixture.nativeElement.textContent;
    expect(component.loading()).toBeFalse();
    expect(component.pendingRequestCount()).toBe(0);
    expect(text).toContain('No pipeline request is currently staged.');
    expect(text).toContain('No jobs recorded.');
  }));

  it('renders pending request handoff and watcher command', fakeAsync(() => {
    startAndFlushInitial({
      rebuild: {
        requestedAt: '2026-05-05T10:00:00.000Z',
        requestedBy: 'Robert',
        reason: 'rebuild',
        status: 'requested',
      },
      enrichment: {
        requestedAt: '2026-05-05T10:05:00.000Z',
        requestedBy: 'Robert',
        type: 'wikidata',
        reason: 'refresh',
        status: 'requested',
      },
    });

    const text = fixture.nativeElement.textContent;
    expect(component.pendingRequestCount()).toBe(2);
    expect(text).toContain('2 requests staged');
    expect(text).toContain('npm run pipeline:watch');
    expect(text).toContain('npm run pipeline:consume');
    expect(text).toContain('npm run pipeline:consume:enrichment');
  }));

  it('blocks blank rebuild reasons before POSTing', fakeAsync(() => {
    startAndFlushInitial();

    component.rebuildReason.set('   ');
    component.requestRebuild();
    tick();

    httpTesting.expectNone('/api/admin/pipeline/rebuild-request');
    expect(component.submitError()).toBe('Reason is required.');
    expect(component.submitting()).toBeFalse();
  }));

  it('trims rebuild request reasons before POSTing', fakeAsync(() => {
    startAndFlushInitial();

    component.rebuildReason.set('  staged file ready  ');
    component.requestRebuild();

    const req = httpTesting.expectOne('/api/admin/pipeline/rebuild-request');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      reason: 'staged file ready',
      requestedBy: 'Robert',
    });
    req.flush({
      requestedAt: '2026-05-05T12:00:00.000Z',
      requestedBy: 'Robert',
      reason: 'staged file ready',
      status: 'requested',
    });
    tick();

    expect(component.rebuildRequest()?.reason).toBe('staged file ready');
    expect(component.submitting()).toBeFalse();
  }));

  it('shows job load errors and running job handoff state', fakeAsync(() => {
    startAndFlushInitial({ jobsError: true });

    expect(component.jobsError()).toBe('Could not load pipeline jobs.');
    expect(fixture.nativeElement.textContent).toContain('Could not load pipeline jobs.');

    component.jobs.set([runningJob]);
    component.jobsError.set(null);
    fixture.detectChanges();

    expect(component.activeJob()?.id).toBe('job-running');
    expect(fixture.nativeElement.textContent).toContain('job-running');
    expect(fixture.nativeElement.textContent).toContain('staged enriched dataset ready');
  }));

  it('loads and toggles a job log', fakeAsync(() => {
    startAndFlushInitial({ jobs: [completedJob] });

    component.toggleJobLog('job-completed');
    const req = httpTesting.expectOne('/api/admin/pipeline/jobs/job-completed/log');
    expect(req.request.method).toBe('GET');
    req.flush('consumer started\nconsumer finished', {
      status: 200,
      statusText: 'OK',
    });
    tick();
    fixture.detectChanges();

    expect(component.expandedJobId()).toBe('job-completed');
    expect(component.expandedLogContent()).toContain('consumer finished');

    component.toggleJobLog('job-completed');
    tick();

    expect(component.expandedJobId()).toBe(null);
    expect(component.expandedLogContent()).toBe(null);
  }));
});
