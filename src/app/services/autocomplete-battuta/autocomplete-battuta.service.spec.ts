import { TestBed } from '@angular/core/testing';

import { AutocompleteBattutaService } from './autocomplete-battuta.service';

describe('AutocompleteBattutaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AutocompleteBattutaService = TestBed.get(AutocompleteBattutaService);
    expect(service).toBeTruthy();
  });
});
