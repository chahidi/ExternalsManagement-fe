import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferCandidatesComponent } from './offer-candidates.component';

describe('OfferCandidatesComponent', () => {
  let component: OfferCandidatesComponent;
  let fixture: ComponentFixture<OfferCandidatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfferCandidatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfferCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
