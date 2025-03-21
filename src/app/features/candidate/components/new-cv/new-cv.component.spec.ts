import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCvComponent } from './new-cv.component';

describe('NewCvComponent', () => {
  let component: NewCvComponent;
  let fixture: ComponentFixture<NewCvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
