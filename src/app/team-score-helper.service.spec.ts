import { TestBed } from '@angular/core/testing';

import { TeamScoreHelperService } from './team-score-helper.service';

describe('TeamScoreHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TeamScoreHelperService = TestBed.get(TeamScoreHelperService);
    expect(service).toBeTruthy();
  });
});
