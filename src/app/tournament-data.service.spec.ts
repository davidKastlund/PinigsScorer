import { TestBed } from '@angular/core/testing';

import { TournamentDataService } from './tournament-data.service';

describe('TournamentDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TournamentDataService = TestBed.get(TournamentDataService);
    expect(service).toBeTruthy();
  });
});
