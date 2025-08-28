import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenErrorComponent } from './token-error.component';

describe('TokenErrorComponent', () => {
  let component: TokenErrorComponent;
  let fixture: ComponentFixture<TokenErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TokenErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
