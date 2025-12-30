import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarVenta } from './registrar-venta';

describe('RegistrarVenta', () => {
  let component: RegistrarVenta;
  let fixture: ComponentFixture<RegistrarVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarVenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
