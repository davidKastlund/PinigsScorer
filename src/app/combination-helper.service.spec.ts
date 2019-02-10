import { TestBed } from '@angular/core/testing';

import { CombinationHelperService } from './combination-helper.service';

describe('CombinationHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CombinationHelperService = TestBed.get(CombinationHelperService);
    expect(service).toBeTruthy();
  });
});
