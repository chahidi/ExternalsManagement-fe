import { TestBed } from '@angular/core/testing';

import { NewCvService } from './new-cv.service';

describe('NewCvService', () => {
  let service: NewCvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewCvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
