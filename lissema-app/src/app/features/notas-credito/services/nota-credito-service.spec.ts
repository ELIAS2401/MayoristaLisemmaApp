import { TestBed } from '@angular/core/testing';

import { NotaCreditoService } from './nota-credito-service';

describe('NotaCreditoService', () => {
  let service: NotaCreditoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotaCreditoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
