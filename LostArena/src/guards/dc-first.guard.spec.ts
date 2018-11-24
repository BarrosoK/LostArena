import { TestBed, async, inject } from '@angular/core/testing';

import { DcFirstGuard } from './dc-first.guard';

describe('DcFirstGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DcFirstGuard]
    });
  });

  it('should ...', inject([DcFirstGuard], (guard: DcFirstGuard) => {
    expect(guard).toBeTruthy();
  }));
});
