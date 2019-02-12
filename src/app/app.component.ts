import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AngularFirestore } from '@angular/fire/firestore';

import { map, take, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Tournament } from './Tournament';
import { TournamentWithId } from './TournamentWithId';
import { GlobalSettings } from './GlobalSettings';
import { CreateNewTournamtentComponent } from './create-new-tournamtent/create-new-tournamtent.component';
import { TournamentDataService } from './tournament-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  tournament$: Observable<TournamentWithId>;
  email: string;
  password: string;
  tournaments$: Observable<TournamentWithId[]>;
  selectedTournamentId$ = new BehaviorSubject<string>(undefined);

  constructor(
    private tournamentData: TournamentDataService,
    public afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    ) {}

  ngOnInit(): void {

    this.tournamentData.getDefaultTournamentId()
      .subscribe(defaultId => this.selectedTournamentId$.next(defaultId));

    this.tournaments$ = this.tournamentData.getTournaments();

    this.tournament$ = this.selectedTournamentId$.pipe(
      switchMap(tournamentId => this.tournamentData.getTournamentById(tournamentId))
    );
  }

  addTournamentFromModal() {
    const dialogRef = this.dialog.open(CreateNewTournamtentComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(newTournamteName => {
      if (!!newTournamteName) {
        this.tournamentData.addNewTournament(newTournamteName)
          .then(id => {
            this.selectedTournamentId$.next(id);
            this.snackBar.open('Turneringen är tillagt!', null, {
              duration: 2000,
            });
          });
      }
    });
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      .catch(reason => reason);
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
