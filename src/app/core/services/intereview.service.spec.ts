import { TestBed } from '@angular/core/testing';

import { IntereviewService } from './intereview.service';

describe('IntereviewService', () => {
  let service: IntereviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntereviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
