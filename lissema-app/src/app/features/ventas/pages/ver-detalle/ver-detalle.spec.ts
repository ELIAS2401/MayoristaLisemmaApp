import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDetalle } from './ver-detalle';

describe('VerDetalle', () => {
  let component: VerDetalle;
  let fixture: ComponentFixture<VerDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
