import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as tournamentActions from './actions/tournament.actions';
import { mergeMap, map, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Tournament } from './Tournament';
import { MatchInFireStore, MatchWithId } from './MatchInFireStore';
import { Team } from './Team';
import { TeamId } from './TeamId';

@Injectable({
  providedIn: 'root'
})
export class TournamentEffects {
  constructor(
    private actions$: Actions,
    private db: AngularFirestore
    ) {}

  @Effect() selectTournament$: Observable<Action> = this.actions$.pipe(
    ofType(tournamentActions.TournamentActionTypes.SetSelectTournamentId),
    switchMap((action: tournamentActions.SetSelectTournamentId) =>
      this.getMatches(action.payload).pipe(
        map(
          matches =>
            new tournamentActions.SetMatchesForTournament({
              tournamentId: action.payload,
              matches
            })
        )
      )
    )
  );

  @Effect() getTeams$: Observable<Action> = this.actions$.pipe(
    ofType(tournamentActions.TournamentActionTypes.SetSelectTournamentId),
    switchMap((action: tournamentActions.SetSelectTournamentId) =>
      this.getTeams(action.payload).pipe(
        map(
          teams =>
            new tournamentActions.SetTeamsForTournament({
              tournamentId: action.payload,
              teams
            })
        )
      )
    )
  );

  @Effect() loadTournaments$: Observable<Action> = this.actions$.pipe(
    ofType(tournamentActions.TournamentActionTypes.Load),
    switchMap(() =>
      this.db
        .collection<Tournament>('tournaments', ref => ref.orderBy('name'))
        .stateChanges()
        .pipe(
          mergeMap(actions => actions),
          map(action => {
            switch (action.type) {
              case 'added':
                return new tournamentActions.AddTournament({
                  tournament: {
                    ...action.payload.doc.data(),
                    id: action.payload.doc.id
                  },
                  index: action.payload.newIndex
                });

              case 'removed':
                return new tournamentActions.RemoveTournament(
                  action.payload.oldIndex
                );

              default:
                return new tournamentActions.ModifyTournament({
                  tournament: {
                    ...action.payload.doc.data(),
                    id: action.payload.doc.id
                  },
                  oldIndex: action.payload.oldIndex,
                  newIndex: action.payload.newIndex
                });
            }
          })
        )
    )
  );

  private getMatches(tournamentId: string): Observable<MatchWithId[]> {
    return this.db
      .doc<Tournament>(`/tournaments/${tournamentId}`)
      .collection<MatchInFireStore>('matches')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            return {
              id: a.payload.doc.id,
              date: data.date && data.date.toDate(),
              team1Id: data.team1.id,
              team2Id: data.team2.id,
              team1Score: data.team1Score,
              team2Score: data.team2Score
            };
          })
        )
      );
  }

  private getTeams(tournamentId: string): Observable<TeamId[]> {
    return this.db
      .doc<Tournament>(`/tournaments/${tournamentId}`)
      .collection<Team>('teams')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => ({
            ...a.payload.doc.data(),
            id: a.payload.doc.id
          }))
        )
      );
  }
}
