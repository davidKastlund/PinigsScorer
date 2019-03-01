import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { TournamentWithId } from '../TournamentWithId';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { TournamentDataService } from '../tournament-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar, MatDialog, MatSidenav } from '@angular/material';
import { switchMap, map, tap } from 'rxjs/operators';
import { CreateNewTournamtentComponent } from '../create-new-tournamtent/create-new-tournamtent.component';
import { Store, select } from '@ngrx/store';
import { State } from '../reducers';
import { SetSelectTournamentId, LoadTournaments } from '../actions/tournament.actions';
import { getSelectedTournament, getAllTournaments, getLoadTournamentsErrorMessage } from '../reducers/tournament.reducer';

/** @title Responsive sidenav */
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnDestroy, OnInit {
  mobileQuery: MediaQueryList;

  tournament$: Observable<TournamentWithId>;
  tournaments$: Observable<TournamentWithId[]>;
  isLoggedIn$: Observable<boolean>;

  @ViewChild('snav') sidenav: MatSidenav;

  private _mobileQueryListener: () => void;
  getTournamentsSubscription: Subscription;
  errorMessage$: Observable<string>;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private tournamentData: TournamentDataService,
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private store: Store<State>,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }


  ngOnInit(): void {
    this.isLoggedIn$ = this.afAuth.user.pipe(map(u => !!u));
    this.tournamentData.getDefaultTournamentId()
      .subscribe(defaultId => {
        this.store.dispatch(new SetSelectTournamentId(defaultId));
      });

    this.store.dispatch(new LoadTournaments());

    this.errorMessage$ = this.store.pipe(select(getLoadTournamentsErrorMessage));

    this.tournaments$ = this.store.pipe(select(getAllTournaments));

    this.tournament$ = this.store.pipe(select(getSelectedTournament));
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
    this.getTournamentsSubscription.unsubscribe();
  }

  async addTournamentFromModal() {
    if (await this.tournamentData.getCanEdit()) {
      const dialogRef = this.dialog.open(CreateNewTournamtentComponent, {
        width: '250px'
      });

      dialogRef.afterClosed().subscribe(newTournamteName => {
        if (!!newTournamteName) {
          this.tournamentData.addNewTournament(newTournamteName)
            .then(id => {
              this.store.dispatch(new SetSelectTournamentId(id));
              this.snackBar.open('Turneringen är tillagt!', null, {
                duration: 2000,
              });
            });
        }
      });
    }
  }

  selectTournament(id: string) {
    if (this.mobileQuery.matches) {
      this.sidenav.close();
    }
    this.store.dispatch(new SetSelectTournamentId(id));
  }

  loginWithDialog() {
    this.tournamentData.getCanEdit();
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}

