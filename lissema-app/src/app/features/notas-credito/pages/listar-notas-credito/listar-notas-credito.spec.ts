import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarNotasCredito } from './listar-notas-credito';

describe('ListarNotasCredito', () => {
  let component: ListarNotasCredito;
  let fixture: ComponentFixture<ListarNotasCredito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarNotasCredito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarNotasCredito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
