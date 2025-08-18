import { TestBed } from '@angular/core/testing';

import { OfferFilterService } from './offer-filter.service';

describe('OfferFilterService', () => {
  let service: OfferFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfferFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
