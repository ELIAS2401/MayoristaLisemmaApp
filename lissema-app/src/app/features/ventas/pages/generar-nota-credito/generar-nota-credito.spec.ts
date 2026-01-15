import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaCredito } from './generar-nota-credito';

describe('NotaCredito', () => {
  let component: NotaCredito;
  let fixture: ComponentFixture<NotaCredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaCredito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotaCredito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
