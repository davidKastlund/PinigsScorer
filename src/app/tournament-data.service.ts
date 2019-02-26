import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Tournament } from './Tournament';
import { AddedMatchDto } from './game-list/AddedMatchDto';
import * as firebase from 'firebase/app';
import { MatchInFireStore } from './MatchInFireStore';
import { EditTeamDto } from './edit-team-dialog/EditTeamDto';
import { Team } from './Team';
import { TeamScore } from './TeamScore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { GlobalSettings } from './GlobalSettings';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TournamentDataService {

  constructor(private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private dialog: MatDialog) { }

  removeMatch(matchId: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    tournament.collection('matches').doc(matchId).delete();
    this.snackBar.open('Matchen är borttagen!', null, {
      duration: 2000,
    });
  }

  getCanEdit(): Promise<boolean> {
    return this.afAuth.user.pipe(take(1))
      .toPromise()
      .then(existingUser => {
        if (!!existingUser) {
          return true;
        }
        return this.dialog.open(LoginDialogComponent).afterClosed().toPromise()
          .then(user => !!user);
      });
  }

  async addMatch(addedMatch: AddedMatchDto, tournamentId: string) {
    if (await this.getCanEdit()) {

      const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

      const timestamp = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
      const newMatch: MatchInFireStore = {
        date: timestamp,
        team1: tournament.collection('teams').doc(addedMatch.team1Id).ref,
        team2: tournament.collection('teams').doc(addedMatch.team2Id).ref,
        team1Score: addedMatch.team1Score,
        team2Score: addedMatch.team2Score
      };
      tournament.collection('matches').add(newMatch);
      this.snackBar.open('Matchen är tillagd!', null, {
        duration: 2000,
      });
    }

  }

  addTeam(teamName: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.collection<Team>('teams').add({ name: teamName });
    this.snackBar.open('Laget är tillagt!', null, {
      duration: 2000,
    });
  }

  editTeam(team: EditTeamDto, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.collection<Team>('teams').doc(team.id).update({ name: team.name });
    this.snackBar.open('Laget är uppdaterat!', null, {
      duration: 2000,
    });
  }

  removeTeam(teamScore: TeamScore, tournamentId: string) {

    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);


    const batch = this.db.firestore.batch();
    batch.delete(tournament.collection('teams').doc(teamScore.teamId).ref);

    teamScore.playedMatches.forEach(matchId => {
      batch.delete(tournament.collection('matches').doc(matchId).ref);
    });

    batch.commit();

    this.snackBar.open('Laget är borttaget!', null, {
      duration: 2000,
    });
  }

  async changeNameOfTournament(name: string, tournamentId: string) {
    const tournamentDoc = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    await tournamentDoc.update({ name: name });
    this.snackBar.open('Namnet är ändrat!', null, {
      duration: 2000,
    });
  }

  changeNumberOfRounds(numberOfRounds: number, tournamentId: string) {
    const tournamentDoc = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    tournamentDoc.update({ numberOfRounds });
    this.snackBar.open('Antal interna möten är uppdaterat är uppdaterat!', null, {
      duration: 2000,
    });
  }

  addNewTournament(newTournamteName: string): Promise<string> {
    return this.db.collection<Tournament>('tournaments')
      .add({ name: newTournamteName, numberOfRounds: 1 })
      .then(ref => ref.id);
  }

  getDefaultTournamentId(): Observable<string> {
    return this.db.doc<GlobalSettings>('settings/globalSettings').valueChanges()
      .pipe(
        take(1),
        map(settings => settings.defaultTournamentId)
      );
  }

  removeTournament(tournamentId: string): Promise<void> {
    return this.db.doc(`/tournaments/${tournamentId}`).delete();
  }


  makeTournamentDefault(tournamentId: string): Promise<void> {
    return this.db.doc<GlobalSettings>('settings/globalSettings').update(<GlobalSettings>{
      defaultTournamentId: tournamentId
    });
  }
}
