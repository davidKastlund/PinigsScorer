import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AngularFirestore } from '@angular/fire/firestore';

import { map, tap, take } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Tournament } from './Tournament';
import { TournamentWithId } from './TournamentWithId';
import { GlobalSettings } from './GlobalSettings';
import { CreateNewTournamtentComponent } from './create-new-tournamtent/create-new-tournamtent.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from './confirm-dialog/ConfirmDialogData';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'gisysPingisApp';

  tournament$: Observable<TournamentWithId>;
  email: string;
  password: string;
  tournaments$: Observable<TournamentWithId[]>;
  selectedTournamentId$ = new BehaviorSubject<string>('gazBtm1efiIZ91nL5ffk');
  globalSettingsRef: firebase.firestore.DocumentReference;

  constructor(private db: AngularFirestore,
    public afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) {

    const tournamentsRef = db.collection<Tournament>('tournaments');

    const globalSettings = db.collection<GlobalSettings>('settings').doc('globalSettings');
    this.globalSettingsRef = globalSettings.ref;

    globalSettings.valueChanges()
      .pipe(take(1))
      .subscribe((settings: GlobalSettings) => this.selectedTournamentId$.next(settings.defaultTournamentId));

    this.tournaments$ = tournamentsRef.snapshotChanges()
      .pipe(
        map(actions => actions.map(t => (<TournamentWithId>{
          id: t.payload.doc.id,
          name: t.payload.doc.data().name
        }))
        )
      );


    this.selectedTournamentId$.pipe(
      tap(tournamentId => {
        if (!!tournamentId) {
          this.tournament$ = db.doc<Tournament>(`/tournaments/${tournamentId}`).snapshotChanges().pipe(
            map(action => {
              if (!action.payload.exists) {
                return null;
              }
              return {
                id: action.payload.id,
                name: action.payload.data().name,
                numberOfRounds: action.payload.data().numberOfRounds,
              };
            })
          );
        }
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

  addTournamentFromModal() {
    const dialogRef = this.dialog.open(CreateNewTournamtentComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(newTournamteName => {
      if (!!newTournamteName) {
        this.db.collection<Tournament>('tournaments').add({ name: newTournamteName, numberOfRounds: 1 })
          .then(ref => {
            this.selectedTournamentId$.next(ref.id);
            this.snackBar.open('Turneringen är tillagt!', null, {
              duration: 2000,
            });
          });
      }
    });
  }

  removeTournament(tournament: TournamentWithId) {
    const data = (<ConfirmDialogData>{
      title: 'Vill du ta bort turneringen?'
    });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '600px', data });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedTournamentId$.next(undefined);
        this.db.collection<Tournament>('tournaments').doc(tournament.id).delete();
        this.snackBar.open('Turneringen är borttagen!', null, {
          duration: 2000,
        });
      }
    });
  }

  makeTournamentDefault(tournament: TournamentWithId) {
    this.globalSettingsRef.update(<GlobalSettings>{ defaultTournamentId: tournament.id });
    this.snackBar.open('Inställningen är sparad!', null, {
      duration: 2000,
    });
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password);
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
