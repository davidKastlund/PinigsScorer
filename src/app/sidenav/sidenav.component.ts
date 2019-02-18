import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy, ViewChild, OnInit} from '@angular/core';
import { TournamentWithId } from '../TournamentWithId';
import { Observable, BehaviorSubject } from 'rxjs';
import { TournamentDataService } from '../tournament-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar, MatDialog, MatSidenav } from '@angular/material';
import { switchMap, map } from 'rxjs/operators';
import { CreateNewTournamtentComponent } from '../create-new-tournamtent/create-new-tournamtent.component';

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
  selectedTournamentId$ = new BehaviorSubject<string>(undefined);
  isLoggedIn$: Observable<boolean>;

  @ViewChild('snav') sidenav: MatSidenav;

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private tournamentData: TournamentDataService,
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog, ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }


  ngOnInit(): void {
    this.isLoggedIn$ = this.afAuth.user.pipe(map(u => !!u));
    this.tournamentData.getDefaultTournamentId()
      .subscribe(defaultId => this.selectedTournamentId$.next(defaultId));

    this.tournaments$ = this.tournamentData.getTournaments();

    this.tournament$ = this.selectedTournamentId$.pipe(
      switchMap(tournamentId => this.tournamentData.getTournamentById(tournamentId))
    );
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
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
              this.selectedTournamentId$.next(id);
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
    this.selectedTournamentId$.next(id);
  }

  loginWithDialog() {
    this.tournamentData.getCanEdit();
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}

