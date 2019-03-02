import { Action } from '@ngrx/store';
import { TournamentWithId } from '../TournamentWithId';
import { MatchWithId } from '../MatchInFireStore';
import { TeamId } from '../TeamId';

export enum TournamentActionTypes {
  SetSelectTournamentId = '[Tournament] SetSelectTournamentId',
  Load = '[Tournament] Load',
  LoadSuccess = '[Tournament] LoadSuccess',
  LoadFail = '[Tournament] LoadFail',
  AddTournament = '[Tournament] AddTournament',
  RemoveTournament = '[Tournament] RemoveTournament',
  ModifyTournament = '[Tournament] ModifyTournament',
  SetMatchesForTournament = '[Tournament] SetMatchesForTournament',
  SetTeamsForTournament = '[Tournament] SetTeamsForTournament',
}

export class SetSelectTournamentId implements Action {
  readonly type = TournamentActionTypes.SetSelectTournamentId;

  constructor(public payload: string) {}
}

export class SetMatchesForTournament implements Action {
  readonly type = TournamentActionTypes.SetMatchesForTournament;

  constructor(
    public payload: { tournamentId: string; matches: MatchWithId[] }
  ) {}
}

export class SetTeamsForTournament implements Action {
  readonly type = TournamentActionTypes.SetTeamsForTournament;

  constructor(
    public payload: { tournamentId: string; teams: TeamId[] }
  ) {}
}

export class LoadTournaments implements Action {
  readonly type = TournamentActionTypes.Load;
  constructor() {}
}

export class LoadTournamentsSuccess implements Action {
  readonly type = TournamentActionTypes.LoadSuccess;
  constructor(public payload: TournamentWithId[]) {}
}

export class AddTournament implements Action {
  readonly type = TournamentActionTypes.AddTournament;
  constructor(
    public payload: { tournament: TournamentWithId; index: number }
  ) {}
}

export class RemoveTournament implements Action {
  readonly type = TournamentActionTypes.RemoveTournament;
  constructor(public payload: number) {}
}

export class ModifyTournament implements Action {
  readonly type = TournamentActionTypes.ModifyTournament;
  constructor(
    public payload: {
      tournament: TournamentWithId;
      oldIndex: number;
      newIndex: number;
    }
  ) {}
}

export class LoadTournamentsFail implements Action {
  readonly type = TournamentActionTypes.LoadFail;
  constructor(public payload: string) {}
}

export type TournamentActions =
  | SetSelectTournamentId
  | LoadTournaments
  | LoadTournamentsSuccess
  | AddTournament
  | RemoveTournament
  | ModifyTournament
  | SetMatchesForTournament
  | SetTeamsForTournament
  | LoadTournamentsFail;
