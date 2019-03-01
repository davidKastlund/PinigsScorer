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
    SetMatches = 'SetMatches',
    SetTeams = 'SetTeams'
}

export class SetSelectTournamentId implements Action {
    readonly type = TournamentActionTypes.SetSelectTournamentId;

    constructor(public payload: string) { }
}

export class SetMatches implements Action {
    readonly type = TournamentActionTypes.SetMatches;

    constructor(public payload: MatchWithId[]) {}
}


export class SetTeams implements Action {
    readonly type = TournamentActionTypes.SetTeams;

    constructor(public payload: TeamId[]) {}
}

export class LoadTournaments implements Action {
    readonly type = TournamentActionTypes.Load;
    constructor() { }
}


export class LoadTournamentsSuccess implements Action {
    readonly type = TournamentActionTypes.LoadSuccess;
    constructor(public payload: TournamentWithId[]) { }
}

export class AddTournament implements Action {
    readonly type = TournamentActionTypes.AddTournament;
    constructor(public payload: {tournament: TournamentWithId, index: number}) { }
}


export class RemoveTournament implements Action {
    readonly type = TournamentActionTypes.RemoveTournament;
    constructor(public payload: number) { }
}

export class ModifyTournament implements Action {
    readonly type = TournamentActionTypes.ModifyTournament;
    constructor(public payload: {tournament: TournamentWithId, oldIndex: number, newIndex: number}) { }
}


export class LoadTournamentsFail implements Action {
    readonly type = TournamentActionTypes.LoadFail;
    constructor(public payload: string) { }
}

export type TournamentActions
                        = SetSelectTournamentId
                        | LoadTournaments
                        | LoadTournamentsSuccess
                        | AddTournament
                        | RemoveTournament
                        | ModifyTournament
                        | SetMatches
                        | SetTeams
                        | LoadTournamentsFail;
